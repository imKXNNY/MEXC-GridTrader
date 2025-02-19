import { Theme } from './theme';

export const getColor = (color: keyof Theme['colors']) => (props: { theme: Theme }) => 
  props.theme.colors[color];

export const getSpacing = (size: keyof Theme['spacing']) => (props: { theme: Theme }) =>
  props.theme.spacing[size];

export const getBreakpoint = (breakpoint: keyof Theme['breakpoints']) => (props: { theme: Theme }) =>
  props.theme.breakpoints[breakpoint];

export const getShadow = (size: keyof Theme['shadows']) => (props: { theme: Theme }) =>
  props.theme.shadows[size];

export const getBorderRadius = (size: keyof Theme['borderRadius']) => (props: { theme: Theme }) =>
  props.theme.borderRadius[size];

export const getTransition = (speed: keyof Theme['transitions']) => (props: { theme: Theme }) =>
  props.theme.transitions[speed];
