import { Skeleton } from "../ui/skeleton";

const SKELETON_WIDTHS = [
  ["72%", "55%", "88%", "61%", "79%", "45%", "93%", "67%"],
  ["58%", "83%", "47%", "76%", "62%", "91%", "53%", "70%"],
  ["85%", "63%", "74%", "49%", "87%", "58%", "68%", "82%"],
  ["61%", "78%", "52%", "89%", "44%", "73%", "96%", "57%"],
  ["76%", "48%", "91%", "65%", "80%", "54%", "72%", "88%"],
  ["53%", "86%", "60%", "77%", "42%", "94%", "66%", "75%"],
];

interface TableLoaderProps {
  rowIndex: number;
  colIndex: number;
}

export default function TableLoader({ rowIndex, colIndex }: TableLoaderProps) {
  const widths = SKELETON_WIDTHS[rowIndex % SKELETON_WIDTHS.length];

  return (
    <div className="min-w-0">
      <Skeleton
        className="h-4 rounded-sm"
        style={{ width: widths[colIndex % widths.length] }}
      />
    </div>
  );
}
