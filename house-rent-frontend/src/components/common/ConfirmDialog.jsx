// src/components/common/ConfirmDialog.jsx
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box
} from '@mui/material'
import { Warning } from '@mui/icons-material'

export default function ConfirmDialog({ open, onClose, onConfirm, title, message }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 38, height: 38, borderRadius: '10px',
            bgcolor: 'rgba(229,57,53,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Warning sx={{ color: '#E53935', fontSize: 20 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{title}</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: '#9E9E9E' }}>{message}</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.15)', color: '#9E9E9E' }}>
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="contained" color="primary">
          Confirm Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
}
