export function gcd(a: number, b: number) {
	const innerGcd = (x: number, y: number): number => (y === 0 ? x : innerGcd(y, x % y));

	return innerGcd(Math.abs(a), Math.abs(b));
}

export function lcm(a: number, b: number) {
	return a / gcd(a, b) * b;
}
