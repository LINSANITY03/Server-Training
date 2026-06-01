/**
 * Safely aggregates and joins CSS class string sequences.
 * Minimizes space pollution from conditionally resolved dynamic layouts.
 */
export function cn(...classes: (string | undefined | null | boolean)[]): string {
    return classes.filter(Boolean).join(" ");
  }
  
  /**
   * Transforms an absolute number of cumulative seconds into an administrative MM:SS digital dashboard format.
   * @param totalSeconds - Cumulative elapsed runtime duration.
   */
  export function formatTime(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    const paddedMinutes = minutes.toString().padStart(2, "0");
    const paddedSeconds = seconds.toString().padStart(2, "0");
    
    return `${paddedMinutes}:${paddedSeconds}`;
  }
  
  /**
   * Transforms an absolute second constraint into an explicit text layout string.
   * Used for high-level analytical data reports.
   */
  export function formatDurationHuman(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    
    if (minutes === 0) {
      return `${remainingSeconds}s`;
    }
    return `${minutes}m ${remainingSeconds}s`;
  }
  
  /**
   * Limits long blocks of text to protect structural boundaries in responsive grid components.
   */
  export function truncateText(text: string, maxCharacters: number): string {
    if (text.length <= maxCharacters) return text;
    return text.slice(0, maxCharacters).trim() + "...";
  }