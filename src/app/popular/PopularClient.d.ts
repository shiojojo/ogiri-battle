import * as React from 'react';
import { Joke, Prompt, Comment, Vote, User } from '../../domain/entities';
interface PopularClientProps {
	jokes: Joke[];
	prompts: Prompt[];
	comments: Comment[];
	scores: Record<string, number>;
	votes: Vote[];
	users: User[];
}
export default function PopularClient(props: PopularClientProps): React.ReactElement;
