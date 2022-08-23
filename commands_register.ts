import { REST } from "@discordjs/rest"
import { Routes } from "discord.js"
import * as fs from "fs";
import Log from "./Log";
export default async function commands_register(token: string, clientId: string, guildId: string) {
    Log.info("commands", "Loading local commands data for guild commands refreshing");
    const commands: any[] = [];
    const commandsDir = fs.readdirSync("./commands").filter(f => f.endsWith(".ts"));
    for (const cmdFile of commandsDir) {
        const cmd = (await import(`./commands/${cmdFile.trim().split(".")[0]}`)).default.data;
        commands.push(cmd.toJSON());
    }
    Log.info("commands", "Loaded local commands data for guild commands refreshing");
    const rest = new REST({ version: '10' }).setToken(token);
    try {
        Log.info("commands", "Started refrehing guild aplication (/) commands");
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );
        Log.success("commands", "Successfully refreshed guild application (/) commands");
    }
    catch (err: any) {
        Log.error("commands", `Couldn't refresh guild application (/) commands due to an unexpected error.\nError: ${err}`);
    }
};