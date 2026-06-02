import { ReactNode } from "react";
import { Icon, Title } from '@atoms';
import { useRouter } from "next/router";

export interface AccordionProps {
	title: string;
	to?: string;
	icon?: ReactNode;
	isOpen?: boolean;
	onToggle?: VoidFunction;
}

export const Accordion = ({
	title,
	to,
	icon,
	isOpen = false,
	onToggle
}: AccordionProps) => {
	const router = useRouter();
	const { pathname } = router;
	const isCurrentRoute = to && pathname === to;
	const isActiveRoute = to && pathname.startsWith(to);

	const handleAccordionClick = () => {
		if (onToggle) {
			onToggle();
		}

		if (to && !isCurrentRoute) {
			router.push(to);
		}
	};

	return (
		<div className="bg-transparent m-0 p-0">
			<div
				className={`flex items-center p-3 cursor-pointer transition-all duration-150 ease-in-out relative m-0 border-l-3 ${
					isActiveRoute
						? 'bg-primary-theme-50 border-l-primary-theme'
						: 'bg-transparent border-l-transparent hover:bg-gray-50 hover:border-l-primary-theme'
				}`}
				onClick={handleAccordionClick}
			>
				<div className={`mr-3 text-base w-5 text-center flex items-center justify-center m-0 p-0 ${
					isActiveRoute ? 'text-primary-theme' : 'text-gray-500'
				}`}>
					{icon}
				</div>
				<div className="flex-1 m-0 p-0">
					<Title s3>{title}</Title>
				</div>
				<div className="ml-auto m-0 p-0">
					<Icon.RightOpen xxs rotate90={isOpen} />
				</div>
			</div>

		</div>
	);
};