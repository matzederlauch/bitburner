/** @param {NS} ns */
export async function main(ns) {
    const target = ns.args[0];
    await ns.grow(target, { threads: ns.args[1] });
}