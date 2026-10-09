import { deployPlugin } from "./lib/deploy-plugin";

try {
	deployPlugin({ required: true });
} catch (error) {
	const message = error instanceof Error ? error.message : String(error);
	console.error(message);
	process.exit(1);
}
