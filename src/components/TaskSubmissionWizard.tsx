import { useEffect, useState } from "react";
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
  Divider,
  Backdrop,
} from "@mui/material";
import {
  useAppKit,
  useAppKitAccount,
  useAppKitProvider,
} from "@reown/appkit/react";
import { Upload, Cpu, Wallet, Check, CreditCard } from "lucide-react";
import { COLORS } from "../theme/theme";
import { BrowserProvider, Contract, formatUnits } from "ethers";
import stableABI from "../contracts/StableCoin.json";
import VideoRenderingABI from "../contracts/VideoRenderTasks.json";
import SimpleBackdrop from "./SimpleBackdrop";
import { CreditCardPayment } from "./CreditCardPayment.tsx";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage, db } from "../config/firebase.js";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";
import { useAllWorkers } from "../hooks/useAllWorkers";

interface TaskSubmissionWizardProps {
  open: boolean;
  onClose: () => void;
}

interface FormData {
  taskName?: string;
  fileName: string;
  file: File;
  fileUrl: string;
  frameFrom: string;
  frameTo: string;
  os: string;
  renderingSoftware: string;
  selectedPlan: string;
  walletConnected: boolean;
}

const steps = ["Upload & Frames", "Rendering Specs", "Workers & Payment"];

const pricingOptions = [
  { id: "cheap", name: "Cheap", price: 13, hours: 49, color: COLORS.green },
  { id: "medium", name: "Medium", price: 50, hours: 30, color: COLORS.blue },
  { id: "fast", name: "Fast", price: 97, hours: 7, color: COLORS.gold },
];

export default function TaskSubmissionWizard({
  open,
  onClose,
}: TaskSubmissionWizardProps) {
  const [activeStep, setActiveStep] = useState(0);
  const initialState = {
    taskName: "",
    fileName: "",
    file: {} as File,
    fileUrl: "",
    frameFrom: "1",
    frameTo: "10",
    os: "linux",
    renderingSoftware: "blender",
    selectedPlan: "medium",
    walletConnected: false,
  };
  const [formData, setFormData] = useState<FormData>(initialState);
  const [backdrop, setBackdrop] = useState({ show: false, message: "" });
  const [paymentMethod, setPaymentMethod] = useState<
    "crypto" | "creditcard" | ""
  >("");
  const [showCreditCardModal, setShowCreditCardModal] = useState(false);
  //WEb3 stuff
  const { open: openWallet } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");
  const { user } = useFirebaseAuth();
  const {
    runningCount,
    runningWorkers,
    offlineWorkers,
    totalCount,
    loading: loadingWorkers,
  } = useAllWorkers();

  const threadCount = Math.max(1, Math.min(10, runningCount));

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith(".blend")) {
      setFormData({ ...formData, fileName: file.name, file: file });
    }
  };

  useEffect(() => {
    setFormData({ ...formData, walletConnected: isConnected });
  }, [isConnected]);

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleConnectWallet = () => {
    if (isConnected) return;
    openWallet();
  };

  const handleClose = () => {
    setFormData(initialState);
    setActiveStep(0);
    onClose();
  };

  const uploadFileToFirebase = async () => {
    return new Promise<string>((resolve, reject) => {
      const storageRef = ref(
        storage,
        `videoRenderingTasks/${formData.fileName}`,
      ); // Create a reference to the file location
      const uploadTask = uploadBytesResumable(storageRef, formData.file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Monitor upload progress
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
          );
          setBackdrop({
            show: true,
            message: `Uploading animation ${formData.fileName}: ${progress}%`,
          });
        },
        (error) => {
          reject(error);
        },
        async () => {
          // Upload completed successfully, now get the download URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        },
      );
    });
  };

  const handleSubmit = async () => {
    setBackdrop({
      show: true,
      message: `Uploading animation ${formData.fileName}...`,
    });

    const downloadUrl = await uploadFileToFirebase();
    setFormData({ ...formData, fileUrl: downloadUrl });

    setBackdrop({
      show: true,
      message: `Submitting rendering task to blockchain...`,
    });

    try {
      const ethersProvider = new BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
      // The Contract object
      const stableContract = new Contract(
        import.meta.env.VITE_BLOCKCHAIN_USDC_CONTRACT_ADDRESS,
        stableABI.abi,
        signer,
      );
      const balance = await stableContract.balanceOf(address);
      console.log("Stablecoin balance:", formatUnits(balance, 6));
      // we check balance just in case we are in a testnet and mint some tokens for testing
      if (balance < 50000000) {
        setBackdrop({
          show: true,
          message: `Sign minting transaction in your wallet...`,
        });
        const mintTx = await stableContract.mint(address, 50000000);
        await mintTx.wait();
      }

      // we check allowance and approve if needed
      const allowance = await stableContract.allowance(
        address,
        import.meta.env.VITE_BLOCKCHAIN_VIDEO_RENDERING_TASKS_CONTRACT_ADDRESS,
      );
      console.log("Stablecoin allowance:", formatUnits(allowance, 6));
      if (allowance < 50000000) {
        setBackdrop({
          show: true,
          message: `Approve cap transfer in your wallet...`,
        });
        const approveTx = await stableContract.approve(
          import.meta.env
            .VITE_BLOCKCHAIN_VIDEO_RENDERING_TASKS_CONTRACT_ADDRESS,
          50000000,
        );
        await approveTx.wait();
      }

      setBackdrop({
        show: true,
        message: `Sign video rendering task submittion in your wallet...`,
      });
      const VideoRenderingContract = new Contract(
        import.meta.env.VITE_BLOCKCHAIN_VIDEO_RENDERING_TASKS_CONTRACT_ADDRESS,
        VideoRenderingABI.abi,
        signer,
      );
      const task = await VideoRenderingContract.createTask(
        downloadUrl,
        "0x3100000000000000000000000000000000000000000000000000000000000000",
        parseInt(formData.frameFrom),
        parseInt(formData.frameTo) + 1,
        threadCount,
        50000000,
      );
      setBackdrop({
        show: true,
        message: `Task submitted, waiting confirmation...`,
      });
      const tx = await task.wait();
      // Parse logs for TaskCreated
      let taskId = null;

      for (const log of tx.logs) {
        try {
          const parsed = VideoRenderingContract.interface.parseLog(log);
          if (parsed?.name === "TaskCreated") {
            taskId = parsed.args.taskId; // bigint in ethers v6
            break;
          }
        } catch (e) {
          // not this contract / not this event
          console.error(e);
        }
      }

      setBackdrop({ show: true, message: `Saving task...` });
      db.collection("videoRenderingTasks")
        .doc(taskId.toString())
        .set({
          id: taskId.toString(),
          taskName: formData.taskName,
          fileName: formData.fileName,
          status: "open",
          creator: user.uid,
          fileUrl: downloadUrl,
          frameFrom: parseInt(formData.frameFrom),
          frameTo: parseInt(formData.frameTo),
          os: formData.os,
          profile:
            "0x3100000000000000000000000000000000000000000000000000000000000000",
          renderingSoftware: formData.renderingSoftware,
          selectedPlan: formData.selectedPlan,
          reward: 50000000,
          rewardCurrency: "USDC",
          rewardFormatted: formatUnits(50000000n, 6),
          createdAt: new Date(),
        });
      handleClose();
    } catch (error) {
      console.log(error);
    } finally {
      setBackdrop({ show: false, message: "" });
    }
  };

  const isStepValid = () => {
    if (activeStep === 0) {
      return (
        formData.taskName &&
        formData.fileName &&
        formData.frameFrom &&
        formData.frameTo
      );
    }
    return true;
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <SimpleBackdrop open={backdrop.show} message={backdrop.message} />
      <DialogTitle>
        <Typography
          sx={{
            fontFamily: '"Playfair Display", serif',
            fontSize: "1.5rem",
            fontWeight: 700,
          }}
        >
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
              <Box marginBottom={3}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Give your task a name
                </Typography>

                <TextField
                  label="Task Name"
                  helperText="This will help you identify your task later"
                  type="text"
                  fullWidth
                  value={formData.taskName}
                  onChange={(e) =>
                    setFormData({ ...formData, taskName: e.target.value })
                  }
                  inputProps={{ min: 1 }}
                />
                <Divider sx={{ my: 2 }} />
              </Box>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Upload Animation File & Frame Range
              </Typography>

              <Paper
                sx={{
                  p: 4,
                  border: `2px dashed ${COLORS.navy}`,
                  borderRadius: 2,
                  textAlign: "center",
                  bgcolor: "rgba(15, 23, 42, 0.02)",
                  mb: 3,
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: "rgba(15, 23, 42, 0.05)",
                  },
                }}
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <Upload
                  size={48}
                  color={COLORS.navy}
                  style={{ marginBottom: 16 }}
                />
                <Typography sx={{ mb: 1, fontWeight: 600 }}>
                  {formData.fileName || "Click to browse for .blend file"}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Supported format: Blender (.blend)
                </Typography>
                <input
                  id="file-upload"
                  type="file"
                  accept=".blend"
                  style={{ display: "none" }}
                  onChange={handleFileUpload}
                />
              </Paper>

              <Grid container spacing={3}>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    label="From Frame"
                    type="number"
                    fullWidth
                    value={formData.frameFrom}
                    onChange={(e) =>
                      setFormData({ ...formData, frameFrom: e.target.value })
                    }
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    label="To Frame"
                    type="number"
                    fullWidth
                    value={formData.frameTo}
                    onChange={(e) =>
                      setFormData({ ...formData, frameTo: e.target.value })
                    }
                    inputProps={{ min: 1 }}
                  />
                </Grid>
              </Grid>

              {formData.fileName && (
                <Alert severity="success" sx={{ mt: 3 }}>
                  File uploaded: {formData.fileName} (
                  {parseInt(formData.frameTo) -
                    parseInt(formData.frameFrom) +
                    1}{" "}
                  frames)
                </Alert>
              )}
            </Box>
          )}

          {activeStep === 1 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Select Rendering Specifications
              </Typography>

              <FormControl component="fieldset" sx={{ mb: 4, width: "100%" }}>
                <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>
                  Operating System
                </FormLabel>
                <RadioGroup
                  value={formData.os}
                  onChange={(e) =>
                    setFormData({ ...formData, os: e.target.value })
                  }
                >
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Paper sx={{ p: 2 }}>
                        <FormControlLabel
                          value="windows"
                          control={<Radio />}
                          disabled
                          label="Windows"
                        />
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Paper sx={{ p: 2 }}>
                        <FormControlLabel
                          value="mac"
                          control={<Radio />}
                          disabled
                          label="Mac"
                        />
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Paper sx={{ p: 2 }}>
                        <FormControlLabel
                          value="linux"
                          control={<Radio />}
                          label="Linux"
                        />
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Paper sx={{ p: 2 }}>
                        <FormControlLabel
                          value="any"
                          control={<Radio />}
                          disabled
                          label="Any"
                        />
                      </Paper>
                    </Grid>
                  </Grid>
                </RadioGroup>
              </FormControl>

              <FormControl component="fieldset" sx={{ width: "100%" }}>
                <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>
                  Rendering Software
                </FormLabel>
                <RadioGroup
                  value={formData.renderingSoftware}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      renderingSoftware: e.target.value,
                    })
                  }
                >
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <Paper sx={{ p: 2 }}>
                        <FormControlLabel
                          value="blender"
                          control={<Radio />}
                          label="Blender"
                        />
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Paper sx={{ p: 2 }}>
                        <FormControlLabel
                          value="corona"
                          control={<Radio />}
                          disabled
                          label="Chaos Corona"
                        />
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Paper sx={{ p: 2 }}>
                        <FormControlLabel
                          value="redshift"
                          control={<Radio />}
                          disabled
                          label="Redshift"
                        />
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Paper sx={{ p: 2 }}>
                        <FormControlLabel
                          value="vray"
                          control={<Radio />}
                          disabled
                          label="V-Ray"
                        />
                      </Paper>
                    </Grid>
                  </Grid>
                </RadioGroup>
              </FormControl>
            </Box>
          )}

          {activeStep === 2 && (
            <Box>
              <Alert
                severity={runningCount > 0 ? "success" : "warning"}
                sx={{ mb: 1 }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Cpu size={20} />
                  <Typography>
                    {loadingWorkers ? (
                      "Searching for available workers..."
                    ) : (
                      <>
                        We found <strong>{totalCount} workers</strong> (
                        {runningCount} running, {offlineWorkers.length} offline)
                      </>
                    )}
                  </Typography>
                </Box>
              </Alert>
              {offlineWorkers.length > 0 && (
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.8125rem",
                    mb: 3,
                    ml: 1,
                    fontStyle: "italic",
                  }}
                >
                  Don't worry, we will notify the inactive workers!
                </Typography>
              )}

              <Paper sx={{ p: 3, mb: 3, bgcolor: "rgba(15, 23, 42, 0.02)" }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  Network Status
                </Typography>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}
                >
                  <Chip
                    label={`${runningCount} running`}
                    size="small"
                    sx={{
                      minWidth: 90,
                      bgcolor: COLORS.greenBg,
                      color: COLORS.green,
                    }}
                  />
                  <Typography variant="body2">
                    Task will be split into{" "}
                    <strong>
                      {threadCount} thread{threadCount !== 1 ? "s" : ""}
                    </strong>
                  </Typography>
                </Box>
                {offlineWorkers.length > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 1,
                    }}
                  >
                    <Chip
                      label={`${offlineWorkers.length} offline`}
                      size="small"
                      sx={{ minWidth: 90 }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      Not currently reachable
                    </Typography>
                  </Box>
                )}
              </Paper>

              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Choose Your Plan
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                {pricingOptions.map((option) => (
                  <Grid size={{ xs: 12, md: 4 }} key={option.id}>
                    <Paper
                      sx={{
                        p: 3,
                        cursor: "pointer",
                        border: `2px solid ${formData.selectedPlan === option.id ? option.color : "transparent"}`,
                        bgcolor:
                          formData.selectedPlan === option.id
                            ? `${option.color}10`
                            : "white",
                        transition: "all 0.2s",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: 3,
                        },
                      }}
                      onClick={() =>
                        setFormData({ ...formData, selectedPlan: option.id })
                      }
                    >
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: "1.25rem",
                          mb: 1,
                          color: option.color,
                        }}
                      >
                        {option.name}
                      </Typography>
                      <Typography
                        sx={{ fontSize: "2rem", fontWeight: 700, mb: 1 }}
                      >
                        ${option.price}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary" }}
                      >
                        Completed in <strong>{option.hours} hours</strong>
                      </Typography>
                      {formData.selectedPlan === option.id && (
                        <Box
                          sx={{
                            mt: 2,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            color: option.color,
                          }}
                        >
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

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Payment Method
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper
                    sx={{
                      p: 3,
                      cursor: "pointer",
                      border: `2px solid ${paymentMethod === "crypto" ? COLORS.navy : "transparent"}`,
                      bgcolor:
                        paymentMethod === "crypto"
                          ? `${COLORS.navy}10`
                          : "white",
                      transition: "all 0.2s",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: 3,
                      },
                    }}
                    onClick={() => setPaymentMethod("crypto")}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 1,
                      }}
                    >
                      <Wallet size={24} color={COLORS.navy} />
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: "1.1rem",
                          color: COLORS.navy,
                        }}
                      >
                        Pay with Crypto
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", ml: 5 }}
                    >
                      Connect your wallet and pay with USDC
                    </Typography>
                    {paymentMethod === "crypto" && (
                      <Box
                        sx={{
                          mt: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          color: COLORS.navy,
                        }}
                      >
                        <Check size={18} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Selected
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper
                    sx={{
                      p: 3,
                      cursor: "pointer",
                      border: `2px solid ${paymentMethod === "creditcard" ? COLORS.blue : "transparent"}`,
                      bgcolor:
                        paymentMethod === "creditcard"
                          ? `${COLORS.blue}10`
                          : "white",
                      transition: "all 0.2s",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: 3,
                      },
                    }}
                    onClick={() => setPaymentMethod("creditcard")}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 1,
                      }}
                    >
                      <CreditCard size={24} color={COLORS.blue} />
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: "1.1rem",
                          color: COLORS.blue,
                        }}
                      >
                        Pay with Credit Card
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", ml: 5 }}
                    >
                      Pay with Stripe, we handle the rest
                    </Typography>
                    {paymentMethod === "creditcard" && (
                      <Box
                        sx={{
                          mt: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          color: COLORS.blue,
                        }}
                      >
                        <Check size={18} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Selected
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              </Grid>

              {paymentMethod === "crypto" && (
                <Box sx={{ display: "flex", gap: 2, flexDirection: "column" }}>
                  {!isConnected ? (
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<Wallet />}
                      onClick={handleConnectWallet}
                      sx={{
                        borderColor: COLORS.navy,
                        color: COLORS.navy,
                        "&:hover": {
                          borderColor: COLORS.navy,
                          bgcolor: "rgba(15, 23, 42, 0.05)",
                        },
                      }}
                    >
                      Connect Wallet
                    </Button>
                  ) : (
                    <Alert severity="success">
                      Wallet connected: {address}
                    </Alert>
                  )}
                </Box>
              )}

              {paymentMethod === "creditcard" && (
                <Box sx={{ display: "flex", gap: 2, flexDirection: "column" }}>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<CreditCard />}
                    onClick={() => setShowCreditCardModal(true)}
                    sx={{
                      borderColor: COLORS.blue,
                      color: COLORS.blue,
                      "&:hover": {
                        borderColor: COLORS.blueDark,
                        bgcolor: COLORS.blueBg,
                      },
                    }}
                  >
                    Enter Card Details
                  </Button>
                </Box>
              )}

              <CreditCardPayment
                open={showCreditCardModal}
                onClose={() => setShowCreditCardModal(false)}
              />
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose}>Cancel</Button>
        {activeStep > 0 && <Button onClick={handleBack}>Back</Button>}
        {activeStep < steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!isStepValid()}
            sx={{
              bgcolor: COLORS.navy,
              "&:hover": { bgcolor: COLORS.navyLight },
            }}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={
              (paymentMethod === "crypto" && !isConnected) ||
              paymentMethod === ""
            }
            sx={{
              bgcolor: COLORS.gold,
              color: COLORS.navy,
              "&:hover": { bgcolor: COLORS.gold, opacity: 0.9 },
            }}
          >
            Submit Task
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
