/** @param {NS} ns */
export async function main(ns) {
    const gbOptions = [];
    for (let i = 0; i <= 20; i++) {
        gbOptions.push(Math.pow(2, i));
    }

    const costs = gbOptions.map(gb => ({
        gb,
        cost: ns.getPurchasedServerCost(gb)
    }));

    costs.forEach(({ gb, cost }) => {
        ns.tprint(`The cost of a server with ${gb} GB is ${formatMoney(cost)}`);
    });
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