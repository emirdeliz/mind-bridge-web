import React, { ReactNode } from 'react';

export type TitleElement =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'p'
  | 'div'
  | 'span';

export interface TitleProps {
  as?: TitleElement;
  children?: string | number | ReactNode;
  capitalize?: boolean;
  fw3?: boolean;
  uppercase?: boolean;
  lowercase?: boolean;
  error?: boolean;
  cursorPointer?: boolean;
  noWrap?: boolean;
  ellipsis?: boolean;
  center?: boolean;
  justify?: boolean;
  role?: string;
  id?: string | number;
  maxWidth?: number;
  white?: boolean;
  blue?: boolean;
  gray?: boolean;
  lightBlue?: boolean;
  n2?: boolean;
  fs3?: boolean;
  fs4?: boolean;
  fs5?: boolean;
  mb1?: boolean;
  mb2?: boolean;
  mb3?: boolean;
  mb4?: boolean;
  mt2?: boolean;
  mt4?: boolean;
  ml5?: boolean;
  p2?: boolean;
  p5?: boolean;
  pl3?: boolean;
  pl4?: boolean;
  pl5?: boolean;
  pl1?: boolean;
  pl2?: boolean;
  pr3?: boolean;
  s1?: boolean;
  s2?: boolean;
  s3?: boolean;
  gradient?: boolean;
  fsHero?: boolean;
  textXs?: boolean;
  textAccent?: boolean;
  trackingWide?: boolean;
  block?: boolean;
  inline?: boolean;
  maxW2xl?: boolean;
  leadingRelaxed?: boolean;
  preLine?: boolean;
  py8?: boolean;
}

export const Title = (props: TitleProps) => {
  const { as: Component = 'div', ...rest } = props;

  const getTitleClasses = () => {
    const baseClasses = ['font-sans', 'leading-tight', 'm-0', 'p-0'];

    if (rest.white) {
      baseClasses.push('text-white');
    } else if (rest.blue) {
      baseClasses.push('text-primary-theme');
    } else if (rest.gray) {
      baseClasses.push('text-mb-muted');
    } else if (rest.lightBlue) {
      baseClasses.push('text-primary-theme-light');
    } else if (rest.error) {
      baseClasses.push('text-red-500');
    } else {
      baseClasses.push('text-mb-text');
    }

    if (rest.fw3) baseClasses.push('font-bold');
    else baseClasses.push('font-medium');

    if (rest.gradient) {
      baseClasses.push('mb-gradient-title');
    }
    if (rest.uppercase) {
      baseClasses.push('uppercase tracking-wide');
    }
    if (rest.trackingWide) baseClasses.push('tracking-wide');
    if (rest.textXs) baseClasses.push('text-xs');
    if (rest.textAccent) baseClasses.push('text-mb-accent');
    if (rest.inline) baseClasses.push('inline');
    else if (rest.block) baseClasses.push('block');
    if (rest.maxW2xl) baseClasses.push('max-w-2xl');
    if (rest.leadingRelaxed) baseClasses.push('leading-relaxed');
    if (rest.preLine) baseClasses.push('whitespace-pre-line');
    if (rest.py8) baseClasses.push('py-8');
    if (rest.lowercase) baseClasses.push('lowercase');
    if (rest.capitalize) baseClasses.push('capitalize');

    if (rest.fsHero) {
      baseClasses.push('text-2xl sm:text-3xl');
    } else if (rest.n2) {
      baseClasses.push('text-2xl');
    } else if (rest.fs3) {
      baseClasses.push('text-lg');
    } else if (rest.fs4) {
      baseClasses.push('text-xl');
    } else if (rest.fs5) {
      baseClasses.push('text-2xl');
    } else if (rest.s1) {
      baseClasses.push('text-sm');
    } else if (rest.s2) {
      baseClasses.push('text-base');
    } else if (rest.s3) {
      baseClasses.push('text-lg');
    }

    if (rest.center) baseClasses.push('text-center');
    if (rest.justify) baseClasses.push('text-justify');

    if (rest.mb1) baseClasses.push('mb-1');
    if (rest.mb2) baseClasses.push('mb-2');
    if (rest.mb3) baseClasses.push('mb-3');
    if (rest.mb4) baseClasses.push('mb-4');
    if (rest.mt2) baseClasses.push('mt-2');
    if (rest.mt4) baseClasses.push('mt-4');
    if (rest.ml5) baseClasses.push('ml-5');
    if (rest.p2) baseClasses.push('p-2');
    if (rest.p5) baseClasses.push('p-5');
    if (rest.pl3) baseClasses.push('pl-3');
    if (rest.pl4) baseClasses.push('pl-4');
    if (rest.pl5) baseClasses.push('pl-5');
    if (rest.pl1) baseClasses.push('pl-1');
    if (rest.pl2) baseClasses.push('pl-2');
    if (rest.pr3) baseClasses.push('pr-3');

    if (rest.noWrap) baseClasses.push('whitespace-nowrap');
    if (rest.ellipsis) {
      baseClasses.push('overflow-hidden text-ellipsis whitespace-nowrap');
    }
    if (rest.cursorPointer) {
      baseClasses.push('cursor-pointer transition-colors duration-200');
    }
    if (rest.maxWidth) baseClasses.push(`max-w-[${rest.maxWidth}px]`);

    return baseClasses.join(' ');
  };

  return (
    <Component
      className={getTitleClasses()}
      id={rest.id !== undefined ? String(rest.id) : undefined}
      role={rest.role}
    >
      {rest.children}
    </Component>
  );
};
