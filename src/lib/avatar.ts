// src/lib/avatar.ts
export function getInitialsAvatar(firstName?: string, lastName?: string): string {
    const initials = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || '?';
    
    // Generate a consistent color based on the name
    const colors = ['#f87171', '#fb923c', '#fbbf24', '#a3e635', '#34d399', '#22d3ee', '#818cf8', '#c084fc', '#f472b6'];
    const colorIndex = (firstName?.charCodeAt(0) ?? 0) % colors.length;
    const bgColor = colors[colorIndex];
    
    // Return a data URI SVG - no network request!
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <rect width="100" height="100" fill="${bgColor}"/>
        <text x="50" y="50" dominant-baseline="central" text-anchor="middle" 
              fill="white" font-family="system-ui, sans-serif" font-size="40" font-weight="600">
          ${initials}
        </text>
      </svg>
    `;
    
    return `data:image/svg+xml,${encodeURIComponent(svg.trim())}`;
  }