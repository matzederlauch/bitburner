/** @param {NS} ns */
export async function main(ns) {
    let gb = ns.args[0];
    const action = ns.args[1];
    let maxScripts = ns.args[2];

    if (typeof gb !== 'number') {
        ns.tprint('Error: The argument must be a number representing the GB of the server.');
        return;
    }

    // Check if the number is a power of 2
    if ((gb & (gb - 1)) !== 0) {
        gb = Math.pow(2, Math.ceil(Math.log2(gb)));
        ns.tprint(`The provided GB is not a power of 2. Rounding up to the nearest power of 2: ${gb} GB`);
    }

    const cost = ns.getPurchasedServerCost(gb);

    if (ns.getServerMoneyAvailable('home') < cost) {
        ns.tprint(`Error: Not enough money to purchase a server with ${gb} GB. Required: ${cost}`);
        return;
    }

    const purchasedServers = ns.getPurchasedServers();
    const serverNumbers = purchasedServers.map(name => parseInt(name.split('-')[1], 10));
    const maxServerNumber = serverNumbers.length > 0 ? Math.max(...serverNumbers) : 0;
    const serverName = `psrv-${maxServerNumber + 1}`;

    const purchased = ns.purchaseServer(serverName, gb);
    if (purchased) {
        ns.tprint(`Server ${serverName} purchased successfully.`);

        if (action === 'hack') {
            // Copy scripts and servers.txt to the new server
            const files = ['hack.js', 'grow.js', 'weaken.js', 'hackinglocal.js', 'servers.txt', 'utils.js'];
            for (const file of files) {
                await ns.scp(file, serverName);
            }

            // Run hackinglocal.js on the new server
            ns.exec('hackinglocal.js', serverName, 1, maxScripts);
        } else if (action === 'hackmax') {
            // Copy hack.js and xpfarm.js to the new server
            const files = ['hack.js', 'grow.js', 'weaken.js', 'hackinglocalmax.js', 'servers.txt', 'utils.js'];
            for (const file of files) {
                await ns.scp(file, serverName);
            }

            // Run xpfarm.js on the new server with the argument 'foodnstuff'
            ns.exec('hackinglocalmax.js', serverName, 1, maxScripts);
        } else if (action === 'farm') {
            // Copy hack.js and xpfarm.js to the new server
            const files = ['hack.js', 'xpfarm.js'];
            for (const file of files) {
                await ns.scp(file, serverName);
            }

            // Run xpfarm.js on the new server with the argument 'foodnstuff'
            ns.exec('xpfarm.js', serverName, 1, 'foodnstuff');
        }
    } else {
        ns.tprint(`Failed to purchase server ${serverName}.`);
    }
}