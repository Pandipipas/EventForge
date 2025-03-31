const { ChatInputCommandInteraction, EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot.js");
const ApplicationCommand = require("../../structure/ApplicationCommand.js");
const axios = require("axios");
const config = require("../../config.js");
const { format } = require("date-fns");
const { enUS } = require("date-fns/locale");

// Game thumbnails map
const gameThumbnails = {
    "Street Fighter 6": "",
    "TEKKEN 8": "",
    "Mortal Kombat 1": "",
    "Guilty Gear Strive": "",
    "Dragon Ball FighterZ": "",
    "Super Smash Bros. Ultimate": "",
    "BlazBlue: Cross Tag Battle": "",
    "King of Fighters XV": "",
    "Soulcalibur VI": "",
    "Rivals of Aether 2": "",
    "default": "https://via.placeholder.com/200" // Default image
};

module.exports = new ApplicationCommand({
    command: {
        name: "challonge_info",
        description: "Gets tournament information from Challonge",
        type: 1,
        options: [
            {
                name: "tournament",
                description: "Select a tournament",
                type: ApplicationCommandOptionType.String,
                required: true,
                autocomplete: true
            }
        ]
    },
    options: {
        cooldown: 5000
    },
    /**
     * Command execution
     * @param {DiscordBot} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        const tournamentID = interaction.options.getString("tournament");

        try {
            // Fetch tournament data
            const { data } = await axios.get(`https://api.challonge.com/v1/tournaments/${tournamentID}.json`, {
                params: { api_key: config.challonge.apiKey }
            });
            const tournament = data.tournament;

            // Fetch participants
            const participantsRes = await axios.get(`https://api.challonge.com/v1/tournaments/${tournamentID}/participants.json`, {
                params: { api_key: config.challonge.apiKey }
            });
            const participants = participantsRes.data.map(p => p.participant.name).join(", ") || "No participants available";

            // Format dates
            const startAt = tournament.start_at ? format(new Date(tournament.start_at), 'dd-MM-yyyy HH:mm', { locale: enUS }) : "Not available";
            const completedAt = tournament.completed_at && tournament.state === 'complete' ? format(new Date(tournament.completed_at), 'dd-MM-yyyy HH:mm', { locale: enUS }) : null;

            // Get game thumbnail
            const gameName = tournament.game_name || "Not available";
            const gameThumbnail = gameThumbnails[gameName] || gameThumbnails["default"];

            // Capitalize tournament type
            const tournamentType = tournament.tournament_type.charAt(0).toUpperCase() + tournament.tournament_type.slice(1);

            // Create embed message
            const embed = new EmbedBuilder()
                .setTitle(`🏆 ${tournament.name}`)
                .setURL(tournament.full_challonge_url)
                .setThumbnail(gameThumbnail)
                .addFields(
                    { name: "📅 Start Date", value: startAt, inline: true },
                    ...(completedAt ? [{ name: "📅 Completion Date", value: completedAt, inline: true }] : []),
                    { name: "🔄 Tournament Type", value: tournamentType, inline: true },
                    { name: "👥 Participants", value: tournament.participants_count.toString(), inline: true },
                    { name: "🎮 Game", value: gameName, inline: true },
                    { name: "🏁 Tournament Link", value: tournament.full_challonge_url, inline: true },
                    { name: "🎮 Participants:", value: participants, inline: false }
                )
                .setColor("Blue")
                .setFooter({
                    text: "Good luck to all participants!",
                    iconURL: "https://storage.crisp.chat/users/helpdesk/website/24688a73-656b-4c92-bdff-4f3f425581c4/c861ab07-0cd6-46a0-badc-b54ec244c35a.png"
                });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "❌ Unable to retrieve tournament information. Ensure the tournament ID is correct.", ephemeral: true });
        }
    }
}).toJSON();
