const { ChatInputCommandInteraction } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot.js");
const ApplicationCommand = require("../../structure/ApplicationCommand.js");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

module.exports = new ApplicationCommand({
    command: {
        name: "challonge_api",
        description: "Change the Challonge API key in the .env file",
        type: 1,
        options: [
            {
                name: "api_key",
                description: "The new Challonge API key",
                type: 3,
                required: true
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
        const newApiKey = interaction.options.getString("api_key"); // Get the new API key

        try {
            // Verify the new API key by making a request to the Challonge API
            const response = await axios.get("https://api.challonge.com/v1/tournaments.json", {
                params: {
                    api_key: newApiKey
                }
            });

            // If the request is successful, update the .env file
            if (response.status === 200) {
                const envPath = path.resolve(__dirname, "../../../.env"); // Path to .env file
                const envData = fs.readFileSync(envPath, "utf-8"); // Read current .env file
                
                // Regex to find existing API key entry
                const apiKeyRegex = /^CHALLONGE_API_KEY=.*/m;

                // Replace existing key or append a new one
                const newEnvData = apiKeyRegex.test(envData)
                    ? envData.replace(apiKeyRegex, `CHALLONGE_API_KEY=${newApiKey}`)
                    : `${envData}\nCHALLONGE_API_KEY=${newApiKey}`;

                fs.writeFileSync(envPath, newEnvData, "utf-8"); // Save changes to .env file

                // Notify user of successful update
                interaction.reply({ content: "✅ The Challonge API key has been updated." });
            }
        } catch (error) {
            console.error(error);
            // Notify user of invalid API key
            interaction.reply({ content: "❌ The provided API key is invalid. Please try with a different key." });
        }
    }
}).toJSON();
