// New file for the throttle utility
export const throttle = <Args extends unknown[], R>(
   func: (...args: Args) => R,
   limit: number
): (...args: Args) => R => {
   let inThrottle: boolean;
   return (...args: Args) => {
      if (!inThrottle) {
         func(...args);
         inThrottle = true;
         setTimeout(() => (inThrottle = false), limit);
      }
      return undefined as R;
   };
}; 