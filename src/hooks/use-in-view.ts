import { useEffect, useRef, useState } from 'react';

type UseInViewOptions = {
	threshold?: number;
	rootMargin?: string;
	triggerOnce?: boolean;
};

export const useInView = ({
	threshold = 0.15,
	rootMargin = '0px',
	triggerOnce = true,
}: UseInViewOptions = {}) => {
	const ref = useRef<HTMLElement | null>(null);
	const [inView, setInView] = useState(false);

	useEffect(() => {
		const node = ref.current;
		if (!node) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setInView(true);
					if (triggerOnce) observer.disconnect();
				} else if (!triggerOnce) {
					setInView(false);
				}
			},
			{ threshold, rootMargin },
		);

		observer.observe(node);
		return () => observer.disconnect();
	}, [threshold, rootMargin, triggerOnce]);

	return { ref, inView };
};
