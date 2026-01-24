import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Box,
  Typography,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  Grid,
  Alert,
  Chip,
} from '@mui/material';
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { Upload, Cpu, Wallet, Check } from 'lucide-react';
import { COLORS } from '../theme/theme';
 

interface TaskSubmissionWizardProps {
  open: boolean;
  onClose: () => void;
}

interface FormData {
  fileName: string;
  frameFrom: string;
  frameTo: string;
  os: string;
  renderingSoftware: string;
  selectedPlan: string;
  walletConnected: boolean;
}

const steps = ['Upload & Frames', 'Rendering Specs', 'Workers & Payment'];

const workerStats = [
  { count: 7, rating: 5, renderTime: 63 },
  { count: 10, rating: 4.3, renderTime: 120 },
  { count: 6, rating: 5, renderTime: 300 },
];

const pricingOptions = [
  { id: 'cheap', name: 'Cheap', price: 13, hours: 49, color: COLORS.green },
  { id: 'medium', name: 'Medium', price: 50, hours: 30, color: COLORS.blue },
  { id: 'fast', name: 'Fast', price: 97, hours: 7, color: COLORS.gold },
];

export default function TaskSubmissionWizard({ open, onClose }: TaskSubmissionWizardProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    fileName: '',
    frameFrom: '1',
    frameTo: '100',
    os: 'any',
    renderingSoftware: 'blender',
    selectedPlan: 'medium',
    walletConnected: false,
  });
  const { open: openWallet } = useAppKit();
  const { address, isConnected, } = useAppKitAccount();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.blend')) {
      setFormData({ ...formData, fileName: file.name });
    }
  };

  useEffect(() => {
    setFormData({ ...formData, walletConnected: isConnected });
  }, [isConnected, formData])
  


  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleConnectWallet = () => {
    openWallet()
  };

  const handleSubmit = () => {
    alert('Task submitted successfully! (Mock)');
    onClose();
    setActiveStep(0);
    setFormData({
      fileName: '',
      frameFrom: '1',
      frameTo: '100',
      os: 'any',
      renderingSoftware: 'blender',
      selectedPlan: 'medium',
      walletConnected: false,
    });
  };

  const isStepValid = () => {
    if (activeStep === 0) {
      return formData.fileName && formData.frameFrom && formData.frameTo;
    }
    return true;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography sx={{ fontFamily: '"Playfair Display", serif', fontSize: '1.5rem', fontWeight: 700 }}>
          Submit New Rendering Task
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Upload Animation File & Frame Range
              </Typography>

              <Paper
                sx={{
                  p: 4,
                  border: `2px dashed ${COLORS.navy}`,
                  borderRadius: 2,
                  textAlign: 'center',
                  bgcolor: 'rgba(15, 23, 42, 0.02)',
                  mb: 3,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'rgba(15, 23, 42, 0.05)',
                  },
                }}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Upload size={48} color={COLORS.navy} style={{ marginBottom: 16 }} />
                <Typography sx={{ mb: 1, fontWeight: 600 }}>
                  {formData.fileName || 'Click to browse for .blend file'}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Supported format: Blender (.blend)
                </Typography>
                <input
                  id="file-upload"
                  type="file"
                  accept=".blend"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
              </Paper>

              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <TextField
                    label="From Frame"
                    type="number"
                    fullWidth
                    value={formData.frameFrom}
                    onChange={(e) => setFormData({ ...formData, frameFrom: e.target.value })}
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="To Frame"
                    type="number"
                    fullWidth
                    value={formData.frameTo}
                    onChange={(e) => setFormData({ ...formData, frameTo: e.target.value })}
                    inputProps={{ min: 1 }}
                  />
                </Grid>
              </Grid>

              {formData.fileName && (
                <Alert severity="success" sx={{ mt: 3 }}>
                  File uploaded: {formData.fileName} ({parseInt(formData.frameTo) - parseInt(formData.frameFrom) + 1} frames)
                </Alert>
              )}
            </Box>
          )}

          {activeStep === 1 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Select Rendering Specifications
              </Typography>

              <FormControl component="fieldset" sx={{ mb: 4, width: '100%' }}>
                <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>
                  Operating System
                </FormLabel>
                <RadioGroup
                  value={formData.os}
                  onChange={(e) => setFormData({ ...formData, os: e.target.value })}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Paper sx={{ p: 2 }}>
                        <FormControlLabel value="windows" control={<Radio />} label="Windows" />
                      </Paper>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Paper sx={{ p: 2 }}>
                        <FormControlLabel value="mac" control={<Radio />} label="Mac" />
                      </Paper>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Paper sx={{ p: 2 }}>
                        <FormControlLabel value="linux" control={<Radio />} label="Linux" />
                      </Paper>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Paper sx={{ p: 2 }}>
                        <FormControlLabel value="any" control={<Radio />} label="I don't care" />
                      </Paper>
                    </Grid>
                  </Grid>
                </RadioGroup>
              </FormControl>

              <FormControl component="fieldset" sx={{ width: '100%' }}>
                <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>
                  Rendering Software
                </FormLabel>
                <RadioGroup
                  value={formData.renderingSoftware}
                  onChange={(e) => setFormData({ ...formData, renderingSoftware: e.target.value })}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2 }}>
                        <FormControlLabel value="blender" control={<Radio />} label="Blender" />
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2 }}>
                        <FormControlLabel value="corona" control={<Radio />} label="Chaos Corona" />
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2 }}>
                        <FormControlLabel value="redshift" control={<Radio />} label="Redshift" />
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2 }}>
                        <FormControlLabel value="vray" control={<Radio />} label="V-Ray" />
                      </Paper>
                    </Grid>
                  </Grid>
                </RadioGroup>
              </FormControl>
            </Box>
          )}

          {activeStep === 2 && (
            <Box>
              <Alert severity="success" sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Cpu size={20} />
                  <Typography>
                    We found <strong>23 workers</strong> with your configuration
                    (15 active, 8 inactive)
                  </Typography>
                </Box>
              </Alert>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.8125rem',
                  mb: 3,
                  ml: 1,
                  fontStyle: 'italic'
                }}
              >
                Don't worry, we will notify the inactive workers!
              </Typography>

              <Paper sx={{ p: 3, mb: 3, bgcolor: 'rgba(15, 23, 42, 0.02)' }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  Worker Statistics:
                </Typography>
                {workerStats.map((stat, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Chip
                      label={`${stat.count} workers`}
                      size="small"
                      sx={{ minWidth: 90 }}
                    />
                    <Typography variant="body2">
                      ⭐ {stat.rating} stars • {stat.renderTime}s/frame average
                    </Typography>
                  </Box>
                ))}
              </Paper>

              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Choose Your Plan
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                {pricingOptions.map((option) => (
                  <Grid item xs={12} md={4} key={option.id}>
                    <Paper
                      sx={{
                        p: 3,
                        cursor: 'pointer',
                        border: `2px solid ${formData.selectedPlan === option.id ? option.color : 'transparent'}`,
                        bgcolor: formData.selectedPlan === option.id ? `${option.color}10` : 'white',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 3,
                        },
                      }}
                      onClick={() => setFormData({ ...formData, selectedPlan: option.id })}
                    >
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: '1.25rem',
                          mb: 1,
                          color: option.color,
                        }}
                      >
                        {option.name}
                      </Typography>
                      <Typography sx={{ fontSize: '2rem', fontWeight: 700, mb: 1 }}>
                        ${option.price}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Completed in <strong>{option.hours} hours</strong>
                      </Typography>
                      {formData.selectedPlan === option.id && (
                        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1, color: option.color }}>
                          <Check size={18} />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            Selected
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                {!formData.walletConnected ? (
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<Wallet />}
                    onClick={handleConnectWallet}
                    sx={{
                      borderColor: COLORS.navy,
                      color: COLORS.navy,
                      '&:hover': {
                        borderColor: COLORS.navy,
                        bgcolor: 'rgba(15, 23, 42, 0.05)',
                      },
                    }}
                  >
                    Connect Wallet (MetaMask)
                  </Button>
                ) : (
                  <Alert severity="success">
                    Wallet connected: {address}
                  </Alert>
                )}
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose}>Cancel</Button>
        {activeStep > 0 && (
          <Button onClick={handleBack}>Back</Button>
        )}
        {activeStep < steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!isStepValid()}
            sx={{
              bgcolor: COLORS.navy,
              '&:hover': { bgcolor: COLORS.navyLight },
            }}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!formData.walletConnected}
            sx={{
              bgcolor: COLORS.gold,
              color: COLORS.navy,
              '&:hover': { bgcolor: COLORS.gold, opacity: 0.9 },
            }}
          >
            Submit Task
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
