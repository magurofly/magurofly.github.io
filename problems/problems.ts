export interface Problem {
	question: string;
	answers: Answer[];
}

export interface Answer {
	isCorrect: boolean;
	text: string;
}

export class Problems extends Array<Problem> {
	private info: any;

	static parse(text: string): Problems {
		text = text.replace(/^#.*\n?$/gm, "");
		const firstNL = text.indexOf("\n");
		const [info, body] = [JSON.parse(text.slice(0, firstNL)), text.slice(firstNL+1)];
		const instance = new Problems(info);

		for (let block of body.split(/\n{2,}/)) {
			let question = null;
			let answers = [];
			for (let line of block.split("\n")) {
				const command = line[0];
				const text = line.slice(1).trim();
				switch (command) {
				case "?":
					if (question) {
						throw new SyntaxError("a problem cannot contain more than two questions");
					}
					question = text;
					break;
				case "o":
					answers.push({isCorrect: true, text});
					break;
				case "x":
					answers.push({isCorrect: false, text});
					break;
				default:
					throw new SyntaxError(`undefined command "${command}"`);
				}
			}

			if (question === null) {
				throw new SyntaxError("a problem must contain one question");
			}

			instance.push({question, answers});
		}

		return instance;
	}

	toString() {
		const info = JSON.stringify(this.info);
		const body = this.map(
			({question, answers}) => `q ${question}\n` + answers.map(
				({isCorrect, text}) => `${isCorrect ? "o" : "x"} ${text}`
				).join("\n")
			).join("\n\n");
		return info + "\n" + body;
	}

	constructor(info: object = {}) {
		super();
		this.info = info;
	}

	add(problem: Problem) {
		this.push(problem);
	}

	shuffled(): Array<Problem> {
		return Problems.copyAndShuffle(this);
	}

	getInfo<T>(key: string, placeholder: T): T {
		return this.info[key] as T || placeholder;
	}

	private static copyAndShuffle(problems: Array<Problem>): Array<Problem> {
		const array = problems.map(problem => {
			const answers = problem.answers.slice();
			shuffle(answers);
			return {question: problem.question, answers};
		});
		shuffle(array);
		return array;
	}
}

function shuffle<T>(array: T[]) {
	for (let i = array.length-1; i >= 1; i--) {
		const j = ~~(Math.random() * (i + 1));
		const tmp = array[i];
		array[i] = array[j];
		array[j] = tmp;
	}
}