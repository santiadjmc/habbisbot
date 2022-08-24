import dotenv from "dotenv";
dotenv.config();
import { Client, Message, GatewayIntentBits } from "discord.js";
import data from "./data";
import * as fs from "fs";
import Log from "./Log";
import commands_register from "./commands_register";
import queries from "./mysql/queries";
import db from "./mysql/database";
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages]
});
const commandsFiles = fs.readdirSync("./commands").filter(f => f.endsWith(".ts"));
(async function () {
    for (const commandFile of commandsFiles) {
        try {
            let command = (await import(`./commands/${commandFile.trim().split(".")[0]}`)).default;
            Log.success("commands", `Successfully loaded local command ${command.data.name}`);
            data.bot.commands.set(command.data.name, command);
        }
        catch (err: any) {
            Log.error("commands", `Error loading local command file ${commandFile}\nError: ${err.stack}`);
            continue;
        }
    }
    Log.info("commands", `Loaded ${data.bot.commands.size}/${commandsFiles.length} local commands`);
})();

client.on("ready", async (): Promise<any> => {
    Log.success("bot", `Successfully logged into discord as ${client.user?.tag}`);
    await commands_register(data.bot.token, "1011457474076876820", "1005164415999549480")
    queries();
});

client.on("interactionCreate", async (interaction): Promise<any> => {
    if (interaction.isChatInputCommand()) {
        const foundCommand: any | undefined = data.bot.commands.get(interaction.commandName);
        if (foundCommand) {
            try {
                await foundCommand.execute(interaction);
                Log.success("bot", `Command '${foundCommand.data.name}' executed successfully by ${interaction.user.tag}`);
            }
            catch (err: any) {
                if (interaction.replied) {
                    await interaction.editReply("Couldn't execute command properly");
                }
                else {
                    await interaction.reply({ ephemeral: true, content: "Couldn't execute command properly" });
                }
                Log.error("bot", `There was an unexpected error while executing slash command '${foundCommand.data.name}'\nerror: ${err}`);
            }
        }
        else  {
            await interaction.reply({ ephemeral: true, content: "Unknown command" });
            Log.info("bot", `User ${interaction.user.tag} tried to execute an unknown slash command`);
        }
    }
    else if (interaction.isButton()) {
        if (interaction.customId.startsWith("delete_avatar")) {
            const author = interaction.customId.slice("delete_avatar_".length);
            if (interaction.user.id !== author) return interaction.reply({ ephemeral: true, content: "Tú no ejecutaste este comando." });
            else interaction.message.delete();
        }
    }
});

client.login(data.bot.token);