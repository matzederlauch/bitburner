/** @param {NS} ns */
export async function main(ns) {
    const visited = new Set();

    async function dfs(server) {
        if (visited.has(server)) return;
        visited.add(server);

        const neighbors = ns.scan(server);
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                await dfs(neighbor);
            }
        }

        if (ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(server) && ns.hasRootAccess(server)) {
            ns.tprint(`Installing backdoor on ${server}`);
            await ns.installBackdoor(server);
        } else {
            ns.tprint(`Cannot install backdoor on ${server}. Hacking level or root access not sufficient.`);
        }
    }

    await dfs('home');
}