const AutocompleteComponent = require("../../structure/AutocompleteComponent.js");
const axios = require("axios");
const config = require("../../config.js");

module.exports = new AutocompleteComponent({
    commandName: "challonge_tournament",
    type: "autocomplete", // Ensure type is "autocomplete"
    run: async (client, interaction) => {
        try {
            const userInput = interaction.options.getFocused(); // User's input
            const { data } = await axios.get("https://api.challonge.com/v1/tournaments.json", {
                params: { api_key: config.challonge.apiKey }
            });

            // Map tournaments to { name, value }
            const tournaments = data.map(({ tournament }) => ({
                name: tournament.name,
                value: tournament.id.toString()
            }));

            // Filter tournaments based on user input
            const filteredTournaments = tournaments
                .filter(({ name }) => name.toLowerCase().includes(userInput.toLowerCase()))
                .slice(0, 25); // Discord allows max 25 options

            await interaction.respond(filteredTournaments);
        } catch (error) {
            console.error("Error fetching tournaments:", error);
            await interaction.respond([]);
        }
    }
}).toJSON();
