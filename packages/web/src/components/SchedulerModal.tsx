import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  LinearProgress, 
  Typography, 
  Box,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { PlayArrow, Stop, CheckCircle, Warning, Speed } from '@mui/icons-material';
import { generateSchedule, SchedulerInput, SchedulerResult } from '@djadwal/scheduler';

interface SchedulerModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (result: SchedulerResult) => void;
  input: SchedulerInput;
}

export const SchedulerModal: React.FC<SchedulerModalProps> = ({ open, onClose, onApply, input }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState({ gen: 0, fitness: 0 });
  const [result, setResult] = useState<SchedulerResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setIsRunning(true);
    setResult(null);
    setError(null);
    setProgress({ gen: 0, fitness: 0 });

    try {
      const schedulerResult = await generateSchedule(input, (gen, fitness) => {
        setProgress({ gen, fitness });
      });
      setResult(schedulerResult);
    } catch (err: any) {
      setError(err.message || 'An error occurred during generation');
    } finally {
      setIsRunning(false);
    }
  };

  const fitnessPercentage = Math.min(Math.round(progress.fitness * 100), 100);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Speed color="primary" />
        توليد الجدول تلقائياً
      </DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            سيقوم النظام باستخدام الخوارزمية الجينية لتوليد أفضل توزيع ممكن للحصص بناءً على القيود المحددة.
          </Typography>

          {isRunning && (
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">الجيل: {progress.gen}</Typography>
                <Typography variant="body2">نسبة الملاءمة: {fitnessPercentage}%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={fitnessPercentage} sx={{ height: 10, borderRadius: 5 }} />
            </Box>
          )}

          {result && (
            <Box sx={{ mt: 3 }}>
              <Alert severity="success" icon={<CheckCircle />}>
                تم توليد الجدول بنجاح بملائمة {Math.round(result.fitnessScore * 100)}%
              </Alert>
              
              {result.constraintViolations.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="warning.main">تنبيهات ({result.constraintViolations.length}):</Typography>
                  <List size="small">
                    {result.constraintViolations.slice(0, 5).map((v, i) => (
                      <ListItem key={i} sx={{ py: 0 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}><Warning fontSize="small" color="warning" /></ListItemIcon>
                        <ListItemText primary={v.description} primaryTypographyProps={{ variant: 'caption' }} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isRunning}>إلغاء</Button>
        {!result ? (
          <Button 
            onClick={handleStart} 
            variant="contained" 
            disabled={isRunning}
            startIcon={isRunning ? undefined : <PlayArrow />}
          >
            {isRunning ? 'جاري التوليد...' : 'بدء التوليد'}
          </Button>
        ) : (
          <Button onClick={() => onApply(result)} variant="contained" color="success">
            تطبيق الجدول
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
