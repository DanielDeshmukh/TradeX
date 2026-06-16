import { List } from "react-window";

export default function VirtualList({ items, height = 400, itemHeight = 50, renderItem }) {
  if (items.length === 0) return null;

  const Row = ({ index, style }) => (
    <div style={style}>
      {renderItem(items[index], index)}
    </div>
  );

  return (
    <List
      height={height}
      itemCount={items.length}
      itemSize={itemHeight}
      width="100%"
    >
      {Row}
    </List>
  );
}
