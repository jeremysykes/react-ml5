import { useState, useRef, useCallback } from 'react';
import {
	DndContext,
	useDraggable,
	useDroppable,
	PointerSensor,
	TouchSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import * as ml5 from 'ml5';
import styles from './App.module.css';

const TOP_K = 5;
const DROP_ZONE_ID = 'drop-zone';

interface Animal {
	id: string;
	label: string;
	src: string;
}

const ANIMALS: Animal[] = [
	{ id: 'animal-frog', label: 'Frog', src: '/assets/frog.png' },
	{ id: 'animal-pig', label: 'Pig', src: '/assets/pig.png' },
	{ id: 'animal-monkey', label: 'Monkey', src: '/assets/monkey.png' },
];

interface Prediction {
	label: string;
	confidence: number;
}

function formatPercent(n: number): string {
	return `${Math.floor(n * 10000) / 100}%`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = src;
	});
}

function DraggableAnimal({ animal }: { animal: Animal }) {
	const { attributes, listeners, setNodeRef, transform, isDragging } =
		useDraggable({
			id: animal.id,
			data: { animal },
		});
	const style = transform
		? { transform: CSS.Translate.toString(transform) }
		: undefined;

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`${styles.animalCard} ${isDragging ? styles.animalCardDragging : ''}`}
			{...listeners}
			{...attributes}
		>
			<img
				src={animal.src}
				alt={animal.label}
				width={120}
				height={120}
				className={styles.animalImage}
			/>
			<span className={styles.animalLabel}>{animal.label}</span>
		</div>
	);
}

function DropZone({ children }: { children: React.ReactNode }) {
	const { setNodeRef, isOver } = useDroppable({ id: DROP_ZONE_ID });

	return (
		<div
			ref={setNodeRef}
			className={`${styles.dropZone} ${isOver ? styles.dropZoneOver : ''}`}
			aria-describedby='drop-instruction'
		>
			{children}
		</div>
	);
}

export default function App() {
	const [predictions, setPredictions] = useState<Prediction[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [isClassifying, setIsClassifying] = useState(false);
	const classifierRef = useRef<Awaited<
		ReturnType<typeof ml5.imageClassifier>
	> | null>(null);

	const getClassifier = useCallback(async () => {
		if (classifierRef.current) return classifierRef.current;
		const classifier = await ml5.imageClassifier('MobileNet');
		classifierRef.current = classifier;
		return classifier;
	}, []);

	const runClassification = useCallback(
		async (animal: Animal) => {
			setIsClassifying(true);
			setError(null);
			setPredictions([]);
			try {
				const img = await loadImage(animal.src);
				const classifier = await getClassifier();
				const results = await classifier.predict(img, TOP_K);
				setPredictions(results);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Classification failed');
			} finally {
				setIsClassifying(false);
			}
		},
		[getClassifier],
	);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
		useSensor(TouchSensor, {
			activationConstraint: { delay: 200, tolerance: 8 },
		}),
	);

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			const { active, over } = event;
			if (!over || over.id !== DROP_ZONE_ID) return;
			const animal = ANIMALS.find((a) => a.id === active.id);
			if (animal) runClassification(animal);
		},
		[runClassification],
	);

	return (
		<main className={styles.app}>
			<h1 className={styles.title}>Animal classifier</h1>
			<p id='drop-instruction' className={styles.instruction}>
				Drag one of the three animals onto the drop area to see how the model
				classifies it.
			</p>

			<DndContext sensors={sensors} onDragEnd={handleDragEnd}>
				<div className={styles.animalRow}>
					{ANIMALS.map((animal) => (
						<DraggableAnimal key={animal.id} animal={animal} />
					))}
				</div>

				<DropZone>
					<span className={styles.dropZoneText}>Drop here to classify</span>
				</DropZone>
			</DndContext>

			<section className={styles.results} aria-live='polite'>
				{isClassifying && <div className={styles.loader} aria-hidden='true' />}
				{error && <p className={styles.error}>{error}</p>}
				{!isClassifying && predictions.length > 0 && (
					<ul className={styles.predictions}>
						{predictions.map((pred, i) => (
							<li key={`${pred.label}-${i}`} className={styles.item}>
								{i + 1}. {pred.label} — {formatPercent(pred.confidence)}
							</li>
						))}
					</ul>
				)}
			</section>
		</main>
	);
}
