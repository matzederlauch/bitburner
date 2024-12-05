/** @param {NS} ns */
export async function main(ns) {
    let gb = ns.args[0]; // Get the first argument passed to the script
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
    ns.tprint(`The cost of a server with ${gb} GB is ${formatMoney(cost)}`);
}

function formatMoney(amount) {
    if (!isFinite(amount)) {
        return 'Infinity';
    }
    if (amount >= 1e9) {
        return (amount / 1e9).toFixed(1) + ' Billion';
    } else if (amount >= 1e6) {
        return (amount / 1e6).toFixed(1) + ' Million';
    } else if (amount >= 1e3) {
        return (amount / 1e3).toFixed(1) + 'k';
    } else {
        return amount.toString();
    }
}