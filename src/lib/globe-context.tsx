import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from 'react';

export type GlobeSectionId =
	| 'home'
	| 'about-me'
	| 'expertise'
	| 'experience'
	| 'projects'
	| 'tech-stack'
	| 'contact';

export const globeSectionIds: GlobeSectionId[] = [
	'home',
	'about-me',
	'expertise',
	'experience',
	'projects',
	'tech-stack',
	'contact',
];

export const globeSectionCount = globeSectionIds.length;

type GlobeContextValue = {
	activeIndex: number;
	setActiveIndex: (index: number) => void;
	rotateToIndex: (index: number) => void;
	rotateToHash: (hash: string) => void;
	registerRotateToIndex: (fn: (index: number) => void) => void;
	introComplete: boolean;
	setIntroComplete: (value: boolean) => void;
};

const GlobeContext = createContext<GlobeContextValue | null>(null);

export const GlobeProvider = ({ children }: { children: ReactNode }) => {
	const [activeIndex, setActiveIndex] = useState(0);
	const [introComplete, setIntroComplete] = useState(false);
	const rotateRef = useRef<(index: number) => void>(() => {});

	const registerRotateToIndex = useCallback((fn: (index: number) => void) => {
		rotateRef.current = fn;
	}, []);

	const rotateToIndex = useCallback((index: number) => {
		const safe =
			((index % globeSectionCount) + globeSectionCount) % globeSectionCount;
		rotateRef.current(safe);
		setActiveIndex(safe);
	}, []);

	const rotateToHash = useCallback(
		(hash: string) => {
			const id = hash.replace(/^#/, '') as GlobeSectionId;
			const index = globeSectionIds.indexOf(id);
			if (index >= 0) rotateToIndex(index);
		},
		[rotateToIndex],
	);

	const value = useMemo(
		() => ({
			activeIndex,
			setActiveIndex,
			rotateToIndex,
			rotateToHash,
			registerRotateToIndex,
			introComplete,
			setIntroComplete,
		}),
		[activeIndex, introComplete, registerRotateToIndex, rotateToHash, rotateToIndex],
	);

	return (
		<GlobeContext.Provider value={value}>{children}</GlobeContext.Provider>
	);
};

export const useGlobe = () => {
	const ctx = useContext(GlobeContext);
	if (!ctx) {
		throw new Error('useGlobe must be used within GlobeProvider');
	}
	return ctx;
};
