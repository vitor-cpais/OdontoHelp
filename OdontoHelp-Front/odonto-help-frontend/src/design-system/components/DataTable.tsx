import {
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';
import type { ReactNode } from 'react';
import EmptyState from './EmptyState';

interface DataTableProps {
  columns: number;
  loading?: boolean;
  empty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  skeletonRows?: number;
  /** Colunas com largura fixa — evita desalinhamento entre linhas */
  fixedLayout?: boolean;
  children: ReactNode;
  pagination?: ReactNode;
}

export default function DataTable({
  columns,
  loading = false,
  empty = false,
  emptyTitle = 'Nenhum registro encontrado',
  emptyDescription,
  skeletonRows = 6,
  fixedLayout = false,
  children,
  pagination,
}: DataTableProps) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', border: '0.5px solid', borderColor: 'divider' }}>
      <TableContainer>
        <Table size="small" sx={fixedLayout ? { tableLayout: 'fixed', width: '100%' } : undefined}>
          {loading ? (
            <TableBody>
              {Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {Array.from({ length: columns }).map((__, columnIndex) => (
                    <TableCell key={columnIndex}>
                      <Skeleton height={20} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          ) : empty ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={columns} align="center">
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            children
          )}
        </Table>
      </TableContainer>
      {pagination}
    </Paper>
  );
}
