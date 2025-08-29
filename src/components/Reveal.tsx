"use client";

import { useEffect, useRef } from "react";

type Props = {
	children: React.ReactNode;
	className?: string;
	delay?: number;
};

export default function Reveal({ children, className = "", delay = 0 }: Props) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.remove("opacity-0", "translate-y-6");
						entry.target.classList.add("opacity-100", "translate-y-0");
					}
				});
			},
			{ threshold: 0.2 }
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	return (
		<div
			ref={ref}
			style={{ transitionDelay: `${delay}ms` }}
			className={`transform-gpu transition-all duration-700 ease-out opacity-0 translate-y-6 ${className}`}
		>
			{children}
		</div>
	);
}
