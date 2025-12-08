import { useState, useEffect } from 'react';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@internavi/ui';

interface ChoosePathStepProps {}

export default function ChoosePathStep({}: ChoosePathStepProps) {
	const [selectedPath, setSelectedPath] = useState<string | null>(null);
	const [studyLevel, setStudyLevel] = useState<string | null>(null);

	useEffect(() => {
		// Get study level from session storage
		const savedLevel = sessionStorage.getItem('studyLevel');
		if (savedLevel) {
			setStudyLevel(savedLevel);
		}
	}, []);

	const handlePathSelect = (path: string) => {
		setSelectedPath(path);
		sessionStorage.setItem('chosenPath', path);
		
		// Scroll to quiz section (will be created in Step 6)
		setTimeout(() => {
			document.getElementById('quiz-section')?.scrollIntoView({ behavior: 'smooth' });
		}, 300);
	};

	const paths = [
		{
			id: 'explore',
			title: 'Explore All Schools',
			description: 'Browse our comprehensive database of schools and filter by your preferences',
			icon: '🔍',
			action: 'Browse Schools'
		},
		{
			id: 'match',
			title: 'Get Matched',
			description: 'Answer a few questions and get personalized school recommendations',
			icon: '✨',
			action: 'Take Quiz'
		}
	];

	return (
		<section className="max-w-6xl mx-auto">
			<div className="text-center mb-8">
				<h2 className="text-3xl font-bold mb-4">Step 2: Choose Your Path</h2>
				<p className="text-muted-foreground">
					{studyLevel 
						? `Great choice! You selected ${studyLevel.replace('-', ' ')}. Now choose how you'd like to proceed.`
						: 'How would you like to find your perfect school?'
					}
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{paths.map((path) => (
					<Card
						key={path.id}
						className={`cursor-pointer transition-all hover:shadow-lg ${
							selectedPath === path.id
								? 'border-primary border-2 bg-primary/5'
								: 'border-border'
						}`}
						onClick={() => handlePathSelect(path.id)}
					>
						<CardHeader>
							<div className="text-5xl mb-4">{path.icon}</div>
							<CardTitle className="text-2xl">{path.title}</CardTitle>
							<CardDescription className="text-base mt-2">
								{path.description}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Button
								variant={selectedPath === path.id ? 'default' : 'outline'}
								className="w-full"
								onClick={(e) => {
									e.stopPropagation();
									handlePathSelect(path.id);
								}}
							>
								{path.action}
							</Button>
						</CardContent>
					</Card>
				))}
			</div>

			{selectedPath && (
				<div className="mt-8 text-center">
					<p className="text-muted-foreground mb-4">
						{selectedPath === 'explore'
							? 'Ready to explore? Click below to browse all schools.'
							: 'Ready to get matched? Click below to start the quiz.'}
					</p>
					<Button
						size="lg"
						onClick={() => {
							if (selectedPath === 'explore') {
								window.location.href = '/explore';
							} else {
								window.location.href = '/quiz';
							}
						}}
					>
						Continue
					</Button>
				</div>
			)}
		</section>
	);
}

