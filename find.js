/** @param {NS} ns */
export async function main(ns) {
    const target = ns.args[0];
    if (!target) {
        ns.tprint("Please provide a target server name.");
        return;
    }

    const visited = new Set();
    const path = [];

    function dfs(server, currentPath) {
        if (visited.has(server)) return false;
        visited.add(server);
        currentPath.push(server);

        if (server === target) {
            path.push(...currentPath);
            return true;
        }

        const neighbors = ns.scan(server);
        for (const neighbor of neighbors) {
            if (dfs(neighbor, currentPath)) return true;
        }

        currentPath.pop();
        return false;
    }

    if (dfs('home', [])) {
        ns.tprint(`Server ${target} found. Path: ${path.join(' -> ')}`);
    } else {
        ns.tprint(`Server ${target} not found.`);
    }
}