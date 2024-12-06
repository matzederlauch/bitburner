/** @param {NS} ns */
export async function main(ns) {
    const target = ns.args[0];
    const hackScript = 'hack.js';
    const currentServer = ns.getHostname();

    while (true) {
        ns.exec(hackScript, currentServer, 30, target);
        await ns.sleep(1);
    }
}