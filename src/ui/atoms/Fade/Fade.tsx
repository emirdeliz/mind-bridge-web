import { ReactNode, useRef, useState, useEffect } from 'react';
import { Transition } from 'react-transition-group';

export interface FadeRouterProps {
  children: ReactNode;
}

export interface FadeProps extends FadeRouterProps {
  inFade: boolean;
}

const FadeBase = ({ children, inFade }: FadeProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const duration = 300; // 300ms transition duration

  return (
    <Transition nodeRef={ref} in={inFade} timeout={duration}>
      {(state) => (
        <div
          ref={ref}
          className={`transition-opacity duration-300 ease-in-out ${
            state === 'entering' || state === 'entered'
              ? 'opacity-100'
              : 'opacity-0'
          }`}
        >
          {children}
        </div>
      )}
    </Transition>
  );
};

const TIME_OUT = 100;

export const Fade = (props: FadeRouterProps) => {
  const [inFade, setInFade] = useState<boolean>(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => setInFade(true), TIME_OUT);
    return () => clearTimeout(timeoutId);
  }, []);
  return <FadeBase {...props} inFade={inFade} />;
};
