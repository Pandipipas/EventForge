const { ChatInputCommandInteraction, EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot.js");
const ApplicationCommand = require("../../structure/ApplicationCommand.js");
const axios = require("axios");
const config = require("../../config.js");
const { format } = require("date-fns");
const { enUS } = require("date-fns/locale");

// Game thumbnails map
const gameThumbnails = {
    "Street Fighter 6": "https://manage.ot-eur-prod.com/media/lp/street6/img/sf6.png",
    "TEKKEN 8": "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/f05a9b5b-ead5-460e-8573-73ba2fff9cde/dgs72ru-529a5528-da92-4eb3-a5b8-0f606390feeb.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2YwNWE5YjViLWVhZDUtNDYwZS04NTczLTczYmEyZmZmOWNkZVwvZGdzNzJydS01MjlhNTUyOC1kYTkyLTRlYjMtYTViOC0wZjYwNjM5MGZlZWIucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.rWvCqPHoMPhuZt8A7pW3UgFDfPTjDkhPHB6SgpKLPxc",
    "TEKKEN 7": "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/76bd7d0b-739d-4f68-b220-81b77f001d13/d7sbcn6-4a74cc76-7dde-4980-a7ed-f146a60bef30.png/v1/fill/w_1024,h_576/tekken_7_by_pedro_croft_d7sbcn6-fullview.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NTc2IiwicGF0aCI6IlwvZlwvNzZiZDdkMGItNzM5ZC00ZjY4LWIyMjAtODFiNzdmMDAxZDEzXC9kN3NiY242LTRhNzRjYzc2LTdkZGUtNDk4MC1hN2VkLWYxNDZhNjBiZWYzMC5wbmciLCJ3aWR0aCI6Ijw9MTAyNCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.T5tTZrkHQAASe4nUugOibnNsOHGsiZXrOcy5TJNDyxM",
    "Mortal Kombat 1": "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/1d36d2cf-42e6-4629-a20a-a69ebb66bf05/dg8jmln-5f735c2d-2f12-419e-a8e6-6b95a45a0945.png/v1/fill/w_1014,h_788/mortal_kombat_1_logo_transparent_by_suleymanlikenan_dg8jmln-pre.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9OTk1IiwicGF0aCI6IlwvZlwvMWQzNmQyY2YtNDJlNi00NjI5LWEyMGEtYTY5ZWJiNjZiZjA1XC9kZzhqbWxuLTVmNzM1YzJkLTJmMTItNDE5ZS1hOGU2LTZiOTVhNDVhMDk0NS5wbmciLCJ3aWR0aCI6Ijw9MTI4MCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.lVAIm3iRPxFbGwns5wDpNrxvFEOViWEOVU9_lNKpTpQ",
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
        name: "challonge_tournament",
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
     * Execute the command
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
