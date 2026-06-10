import React, { ReactNode } from 'react';

export interface TitleProps {
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
  py8?: boolean;
}

export const Title = (props: TitleProps) => {
  const getTitleClasses = () => {
    const baseClasses = [
      'font-poppins',
      'leading-tight',
      'm-0',
      'p-0'
    ];

    // Cores - white deve sobrescrever a cor base
    if (props.white) {
      baseClasses.push('text-white');
    } else if (props.blue) {
      baseClasses.push('text-primary-theme');
    } else if (props.gray) {
      baseClasses.push('text-mb-muted');
    } else if (props.lightBlue) {
      baseClasses.push('text-primary-theme-light');
    } else if (props.error) {
      baseClasses.push('text-red-500');
    } else {
      // Cor padrão apenas se nenhuma cor específica for definida
      baseClasses.push('text-mb-text');
    }

    // Pesos da fonte
    if (props.fw3) baseClasses.push('font-bold');
    else baseClasses.push('font-medium');

    // Transformações de texto
    if (props.gradient) {
      baseClasses.push('mb-gradient-title');
    }
    if (props.uppercase) {
      baseClasses.push('uppercase tracking-wide');
    }
    if (props.trackingWide) baseClasses.push('tracking-wide');
    if (props.textXs) baseClasses.push('text-xs');
    if (props.textAccent) baseClasses.push('text-mb-accent');
    if (props.inline) baseClasses.push('inline');
    else if (props.block) baseClasses.push('block');
    if (props.maxW2xl) baseClasses.push('max-w-2xl');
    if (props.leadingRelaxed) baseClasses.push('leading-relaxed');
    if (props.py8) baseClasses.push('py-8');
    if (props.lowercase) baseClasses.push('lowercase');
    if (props.capitalize) baseClasses.push('capitalize');

    // Tamanhos de fonte
    if (props.fsHero) {
      baseClasses.push('text-2xl sm:text-3xl');
    } else if (props.n2) {
      baseClasses.push('text-2xl');
    } else if (props.fs3) {
      baseClasses.push('text-lg');
    } else if (props.fs4) {
      baseClasses.push('text-xl');
    } else if (props.fs5) {
      baseClasses.push('text-2xl');
    } else if (props.s1) {
      baseClasses.push('text-sm');
    } else if (props.s2) {
      baseClasses.push('text-base');
    } else if (props.s3) {
      baseClasses.push('text-lg');
    }

    // Alinhamento
    if (props.center) baseClasses.push('text-center');
    if (props.justify) baseClasses.push('text-justify');

    // Espaçamento
    if (props.mb1) baseClasses.push('mb-1');
    if (props.mb2) baseClasses.push('mb-2');
    if (props.mb3) baseClasses.push('mb-3');
    if (props.mb4) baseClasses.push('mb-4');
    if (props.mt2) baseClasses.push('mt-2');
    if (props.ml5) baseClasses.push('ml-5');
    if (props.p2) baseClasses.push('p-2');
    if (props.p5) baseClasses.push('p-5');
    if (props.pl3) baseClasses.push('pl-3');
    if (props.pl4) baseClasses.push('pl-4');
    if (props.pl5) baseClasses.push('pl-5');
    if (props.pl1) baseClasses.push('pl-1');
    if (props.pl2) baseClasses.push('pl-2');
    if (props.pr3) baseClasses.push('pr-3');

    // Outros estilos
    if (props.noWrap) baseClasses.push('whitespace-nowrap');
    if (props.ellipsis) {
      baseClasses.push('overflow-hidden text-ellipsis whitespace-nowrap');
    }
    if (props.cursorPointer) {
      baseClasses.push('cursor-pointer transition-colors duration-200');
    }
    if (props.maxWidth) baseClasses.push(`max-w-[${props.maxWidth}px]`);

    return baseClasses.join(' ');
  };

  return (
    <div className={getTitleClasses()} role={props.role}>
      {props.children}
    </div>
  );
};
