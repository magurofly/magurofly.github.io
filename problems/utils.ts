function msecsToString(msec: number): string {
	const msecStr = (msec % 1000 + "").padEnd(3, "0");
	const secStr = (~~(msec / 1e3) % 60 + "").padStart(2, "0");
	const minStr = (~~(msec / 60e3) + "").padStart(2, "0");
	return `${minStr}:${secStr}.${msecStr}`;
}