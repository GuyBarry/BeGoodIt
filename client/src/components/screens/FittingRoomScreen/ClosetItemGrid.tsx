import { Box, Chip, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { PRIMARY_ALPHA } from '../../../styles/tokens';
import { useGarmentCategories } from '../../../api';
import { closetItems, type ClosetItem } from './data';

interface Props {
  selectedItems: number[];
  suggestedItems: number[];
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
  onToggleItem: (id: number) => void;
}

function ClosetItemCard({
  item,
  isSelected,
  isSuggested,
  selectionIndex,
  onToggle,
}: {
  item: ClosetItem;
  isSelected: boolean;
  isSuggested: boolean;
  selectionIndex: number;
  onToggle: () => void;
}) {
  return (
    <Box
      component="button"
      onClick={onToggle}
      sx={{
        position: 'relative',
        aspectRatio: '3/4',
        borderRadius: 3,
        overflow: 'hidden',
        bgcolor: '#fff',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        outline: isSelected ? '3px solid' : isSuggested ? '2px solid' : 'none',
        outlineColor: isSelected ? 'primary.main' : 'warning.main',
        outlineOffset: isSelected ? 2 : 1,
        transform: isSelected ? 'scale(0.95)' : 'scale(1)',
        transition: 'transform 0.2s ease, outline 0.2s ease',
        '&:hover': { transform: 'scale(0.95)' },
      }}
    >
      <Box
        component="img"
        src={item.image}
        alt={item.name}
        sx={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
      />
      {isSelected && (
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: PRIMARY_ALPHA[20], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{selectionIndex}</Typography>
          </Box>
        </Box>
      )}
      {isSuggested && !isSelected && (
        <Box sx={{ position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: '50%', bgcolor: 'warning.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AutoAwesomeIcon sx={{ fontSize: 12, color: '#fff' }} />
        </Box>
      )}
      <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, px: 1, py: 0.75, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }}>
        <Typography sx={{ color: '#fff', fontSize: 10, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.name}
        </Typography>
      </Box>
    </Box>
  );
}

export default function ClosetItemGrid({ selectedItems, suggestedItems, activeCategory, onCategoryChange, onToggleItem }: Props) {
  const { data: garmentCategories = [] } = useGarmentCategories();
  const filtered = activeCategory === 'all'
    ? closetItems
    : closetItems.filter(i => i.type.toLowerCase() === activeCategory.toLowerCase());

  return (
    <>
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        {[{ id: 'all', name: 'All' }, ...garmentCategories.map(c => ({ id: c.name.toLowerCase(), name: c.name }))].map(cat => (
          <Chip
            key={cat.id}
            label={cat.name}
            onClick={() => onCategoryChange(cat.id)}
            sx={{
              fontWeight: 500,
              px: 1,
              borderRadius: 2.5,
              ...(activeCategory === cat.id
                ? { bgcolor: 'text.primary', color: 'background.paper', '&:hover': { bgcolor: 'text.primary' } }
                : { bgcolor: 'action.hover', color: 'text.secondary', '&:hover': { bgcolor: 'action.selected' } }
              ),
            }}
          />
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.5 }}>
        {filtered.map(item => (
          <ClosetItemCard
            key={item.id}
            item={item}
            isSelected={selectedItems.includes(item.id)}
            isSuggested={suggestedItems.includes(item.id)}
            selectionIndex={selectedItems.indexOf(item.id) + 1}
            onToggle={() => onToggleItem(item.id)}
          />
        ))}
      </Box>
    </>
  );
}
