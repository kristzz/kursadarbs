type GridStylesFunction = (type: string, index: number, totalSections: number) => string;

export const getGridStyles: GridStylesFunction = (type, index, totalSections) => {
    // Mobile: Single column (col-span-6)
    // Tablet: Two columns (sm:col-span-3)
    // Desktop: Complex grid (md:col-span-*)
    const baseStyles = "col-span-6"; // Mobile: Full width stacked

    // Tablet layout: Always two columns
    const tabletStyles = index % 2 === 0 
        ? "sm:col-span-3" // Left column
        : "sm:col-span-3"; // Right column

    // Desktop layouts
    const desktopStyles = (() => {
        switch(totalSections) {
            case 1:
                return "md:col-span-6";
            case 2:
                return {
                    0: "md:col-span-4",
                    1: "md:col-span-2",
                }[index] || "md:col-span-2";
            case 3:
                return {
                    0: "md:col-span-3",
                    1: "md:col-span-3",
                    2: "md:col-span-6",
                }[index] || "md:col-span-2";
            case 4:
                return {
                    0: "md:col-span-4",
                    1: "md:col-span-2",
                    2: "md:col-span-3",
                    3: "md:col-span-3",
                }[index] || "md:col-span-2";
            case 5:
                return {
                    0: "md:col-span-6",
                    1: "md:col-span-2",
                    2: "md:col-span-2",
                    3: "md:col-span-2",
                    4: "md:col-span-6",
                }[index] || "md:col-span-2";
            case 6:
                return {
                    0: "md:col-span-4",
                    1: "md:col-span-2",
                    2: "md:col-span-3",
                    3: "md:col-span-3",
                    4: "md:col-span-4",
                    5: "md:col-span-2",
                }[index] || "md:col-span-2";
            case 7:
                return {
                    0: "md:col-span-4 md:row-span-2",
                    1: "md:col-span-2 md:row-span-2",
                    2: "md:col-span-3",
                    3: "md:col-span-3",
                    4: "md:col-span-2",
                    5: "md:col-span-2",
                    6: "md:col-span-2",
                }[index] || "md:col-span-2";
            default:
                return "md:col-span-2";
        }
    })();

    return `${baseStyles} ${tabletStyles} ${desktopStyles}`;
}; 