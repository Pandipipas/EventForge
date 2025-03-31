const { ChatInputCommandInteraction } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot.js");
const ApplicationCommand = require("../../structure/ApplicationCommand.js");
const axios = require("axios");
const config = require("../../config.js");

module.exports = new ApplicationCommand({
    command: {
        name: "challonge_test",
        description: "Tests the connection with Challonge",
        type: 1,
        options: []
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
        try {
            // Test API connection using stored API key
            const response = await axios.get("https://api.challonge.com/v1/tournaments.json", {
                params: {
                    api_key: config.challonge.apiKey
                }
            });

            const tournaments = response.data;

            if (tournaments.length === 0) {
                return interaction.reply({ content: "✅ Connected to Challonge, but no tournaments found." });
            }

            interaction.reply({
                content: `✅ Connected to Challonge. Tournaments found: ${tournaments.length}`
            });

        } catch (error) {
            console.error(error);
            interaction.reply({ content: "❌ Error connecting to Challonge." });
        }
    }
}).toJSON();
