import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  TextField,
  Button,
  Paper,
  Grid,
  IconButton,
  TextareaAutosize,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const TodaysBills = () => {
  const [rows, setRows] = useState([]);
  const [liftingRate, setLiftingRate] = useState("");
  const [liftingCompanyName, setLiftingCompanyName] = useState("");
  const [driverName, setDriverName] = useState("");
  const [cleanerName, setCleanerName] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [cashCounts, setCashCounts] = useState({
    500: "",
    200: "",
    100: "",
    50: "",
    20: "",
    10: "",
  });
  const [expenses, setExpenses] = useState("");
  const [dailyNote, setDailyNote] = useState("");
  const [liftingWeight,setLiftingWeight] = useState("")
  const [morgavRate,setMorgavRate] = useState("")
  const getFormattedDate = () => {
    const today = new Date();
    return today.toLocaleDateString("en-GB").split("/").reverse().join("-");
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/customers");
        const data = response.data;

        const initialRows = data.map((customer) => ({
          customerName: customer.name,
          quantity: "",
          weight: "",
          rate: "",
          payment: 0,
          duePayment: customer.duePayment || 0,
          totalPayment: 0,
          creditPayment: "",
          totalDuePayment: customer.duePayment || 0,
        }));

        setRows(initialRows);
      } catch (error) {
        console.error("Error fetching customers:", error);
        toast.error("Failed to load customer data.");
      }
    };

    fetchCustomers();
  }, []);

  const handleInputChange = (index, field, value) => {
    // Ensure weight accepts only valid decimal numbers
    if (field === "weight") {
      const regex = /^\d*\.?\d*$/; // Matches positive numbers with optional decimal part
      if (!regex.test(value)) {
        toast.error("Invalid weight value. Please enter a valid number.");
        return;
      }
    }

    const updatedRows = rows.map((row, i) => {
      if (i === index) {
        const updatedRow = { ...row, [field]: value };

        // Recalculate dependent fields if weight or rate is updated
        if (field === "weight" || field === "rate") {
          updatedRow.payment =
            (parseFloat(updatedRow.weight) || 0) *
            (parseFloat(updatedRow.rate) || 0);
        }
        updatedRow.totalPayment =
          (updatedRow.payment || 0) + (updatedRow.duePayment || 0);
        updatedRow.totalDuePayment =
          (updatedRow.totalPayment || 0) -
          (parseFloat(updatedRow.creditPayment) || 0);

        return updatedRow;
      }
      return row;
    });

    setRows(updatedRows);
  };

  const validateInputs = () => {
    const errors = {};

    // Validate lifting-related fields
    if (!liftingRate.trim()) errors.liftingRate = "Lifting rate is required.";
    if (!morgavRate.trim()) errors.morgavRate = "morgav rate is required.";
    if (!liftingCompanyName.trim())
      errors.liftingCompanyName = "Lifting company name is required.";
    if (!driverName.trim()) errors.driverName = "Driver name is required.";
    if (!cleanerName.trim()) errors.cleanerName = "Cleaner name is required.";

    // Validate each row
    const rowErrors = rows.map((row) => {
      const rowError = {};
      if (!row.quantity.trim()) rowError.quantity = "Quantity is required.";
      if (!row.weight.trim()) rowError.weight = "Weight is required.";
      if (!row.rate.trim()) rowError.rate = "Rate is required.";
      if (!row.creditPayment.trim())
        rowError.creditPayment = "Credit payment is required.";
      return rowError;
    });

    errors.rows = rowErrors;

    setValidationErrors(errors);

    // Check if there are any errors
    const hasRowErrors = rowErrors.some(
      (rowError) => Object.keys(rowError).length > 0
    );
    const hasMainErrors = Object.keys(errors).length > 1; // `1` because `errors.rows` is always there

    return !hasMainErrors && !hasRowErrors;
  };

  const saveBill = async () => {
    if (!validateInputs()) {
        toast.error("Please fill all required fields.");
        return;
    }

    // Ensure cashCounts has numeric values
    const normalizedCashCounts = {};
    Object.entries(cashCounts).forEach(([key, value]) => {
        normalizedCashCounts[key] = parseInt(value) || 0;
    });
    // console.log(normalizedCashCounts,"?????????")
    const payload = {
        date: getFormattedDate(),
        liftingRate,
        liftingCompanyName,
        driverName,
        cleanerName,
        rows,
        totals: {
            quantity: calculateTotal("quantity"),
            weight: calculateTotal("weight"),
            payment: calculateTotal("payment"),
            duePayment: calculateTotal("duePayment"),
            totalPayment: calculateTotal("totalPayment"),
            creditPayment: calculateTotal("creditPayment"),
            totalDuePayment: calculateTotal("totalDuePayment"),
        },
        morgavRate,
        liftingWeight,
        notes: dailyNote,
        cashCounts: normalizedCashCounts, // Send properly normalized data
        expenses,
        additionalTip: "No tip added yet.",
    };

    try {
        await axios.post("http://localhost:5000/bills", payload);
        toast.success("Bill and additional data saved successfully!");
    } catch (error) {
        console.error("Error saving bill and additional data:", error);
        toast.error("Failed to save bill.");
    }
};




  const calculateTotal = (field) =>
    rows.reduce((sum, row) => sum + (parseFloat(row[field]) || 0), 0);

  return (
    <Box p={1} sx={{ width: "100%" }}>
      <Typography variant="h5" gutterBottom textAlign={"center"}>
        Momin Chicken Suppliers
      </Typography>
      <Box display={"flex"} gap={9}>
      <Typography variant="h6" gutterBottom textAlign={"center"} mt={2} mb={2}>
        Address: <Typography fontSize={"16px"} display={"inline"}>68|6, Hajaremala,umbraj.Tal-karad,dist-satara,415109</Typography>
      </Typography>
      <Typography variant="h6" gutterBottom textAlign={"center"}  mt={2} mb={2}>
        Prop: <Typography fontSize={"16px"} display={"inline"}>Late H.shabbir A. Momin and sons</Typography>
        <Typography variant="h6">Contact No.- <Typography display={"inline"}>9850697429 , 9970772324</Typography></Typography>
      </Typography>
      </Box>
      <Box sx={{ mb: 3 }}>
  <Grid container spacing={3}>
    {/* First Column */}
    <Grid item xs={12} sm={6}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Date
      </Typography>
      <Typography
        variant="h6"
        sx={{
          border: "1px solid #ccc",
          padding: "6px",
          borderRadius: "4px",
          mb: 3, // Add space below
        }}
      >
        {getFormattedDate()}
      </Typography>
      <TextField
        label="Lifting Rate"
        type="number"
        value={liftingRate}
        onChange={(e) => setLiftingRate(e.target.value)}
        error={!!validationErrors.liftingRate}
        helperText={validationErrors.liftingRate}
        fullWidth
        sx={{
          "& input[type=number]::-webkit-inner-spin-button": {
            display: "none",
          },
          "& input[type=number]::-webkit-outer-spin-button": {
            display: "none",
          },
          "-moz-appearance": "textfield",
        }}
      />
      <TextField
        label="Morgav Rate"
        type="number"
        value={morgavRate}
        onChange={(e) => setMorgavRate(e.target.value)}
        error={!!validationErrors.morgavRate}
        helperText={validationErrors.morgavRate}
        fullWidth
        sx={{
          mt: 3, // Add space above
          "& input[type=number]::-webkit-inner-spin-button": {
            display: "none",
          },
          "& input[type=number]::-webkit-outer-spin-button": {
            display: "none",
          },
          "-moz-appearance": "textfield",
        }}
      />
    </Grid>

    {/* Second Column */}
    <Grid item xs={12} sm={6} mt={3}>
      <TextField
        label="Lifting Company"
        value={liftingCompanyName}
        onChange={(e) => setLiftingCompanyName(e.target.value)}
        error={!!validationErrors.liftingCompanyName}
        helperText={validationErrors.liftingCompanyName}
        fullWidth
      />
      <TextField
        label="Driver Name"
        value={driverName}
        onChange={(e) => setDriverName(e.target.value)}
        error={!!validationErrors.driverName}
        helperText={validationErrors.driverName}
        fullWidth
        sx={{ mt: 3 }} // Add space above
      />
      <TextField
        label="Cleaner Name"
        value={cleanerName}
        onChange={(e) => setCleanerName(e.target.value)}
        error={!!validationErrors.cleanerName}
        helperText={validationErrors.cleanerName}
        fullWidth
        sx={{ mt: 3 }} // Add space above
      />
    </Grid>
  </Grid>
</Box>


      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Customer Name</TableCell>
              <TableCell>Quantity(birds)</TableCell>
              <TableCell>Weight(kg)</TableCell>
              <TableCell>Rate(rs)</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Due Payment</TableCell>
              <TableCell>Total Payment</TableCell>
              <TableCell>Credit Payment</TableCell>
              <TableCell>Total Due Payment</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>
                <TableCell
                  sx={{
                    width: "15em",
                  }}
                >
                  <Typography>{row.customerName}</Typography>
                </TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={row.quantity}
                    onChange={(e) =>
                      handleInputChange(index, "quantity", e.target.value)
                    }
                    error={!!validationErrors.rows?.[index]?.quantity}
                    helperText={validationErrors.rows?.[index]?.quantity}
                    sx={{
                      width: "6em",
                      "& input[type=number]::-webkit-inner-spin-button": {
                        display: "none",
                      },
                      "& input[type=number]::-webkit-outer-spin-button": {
                        display: "none",
                      },
                      "-moz-appearance": "textfield",
                    }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={row.weight}
                    onChange={(e) =>
                      handleInputChange(index, "weight", e.target.value)
                    }
                    error={!!validationErrors.rows?.[index]?.weight}
                    helperText={validationErrors.rows?.[index]?.weight}
                    sx={{
                      width: "6em",
                      "& input[type=number]::-webkit-inner-spin-button": {
                        display: "none",
                      },
                      "& input[type=number]::-webkit-outer-spin-button": {
                        display: "none",
                      },
                      "-moz-appearance": "textfield",
                    }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={row.rate}
                    onChange={(e) =>
                      handleInputChange(index, "rate", e.target.value)
                    }
                    error={!!validationErrors.rows?.[index]?.rate}
                    helperText={validationErrors.rows?.[index]?.rate}
                    sx={{
                      width: "6em",
                      "& input[type=number]::-webkit-inner-spin-button": {
                        display: "none",
                      },
                      "& input[type=number]::-webkit-outer-spin-button": {
                        display: "none",
                      },
                      "-moz-appearance": "textfield",
                    }}
                  />
                </TableCell>
                <TableCell>{row.payment.toFixed(2)}</TableCell>
                <TableCell>{row.duePayment.toFixed(2)}</TableCell>
                <TableCell>{row.totalPayment.toFixed(2)}</TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={row.creditPayment}
                    onChange={(e) =>
                      handleInputChange(index, "creditPayment", e.target.value)
                    }
                    error={!!validationErrors.rows?.[index]?.creditPayment}
                    helperText={validationErrors.rows?.[index]?.creditPayment}
                    sx={{
                      width: "6em",
                      "& input[type=number]::-webkit-inner-spin-button": {
                        display: "none",
                      },
                      "& input[type=number]::-webkit-outer-spin-button": {
                        display: "none",
                      },
                      "-moz-appearance": "textfield",
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Typography>{row.totalDuePayment.toFixed(2)}</Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>
                <Typography variant="h6">Totals</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h6">
                  {calculateTotal("quantity")}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h6">
                  {calculateTotal("weight").toFixed(2)}
                </Typography>
              </TableCell>
              <TableCell />
              <TableCell>
                <Typography variant="h6">
                  {calculateTotal("payment").toFixed(2)}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h6">
                  {calculateTotal("duePayment").toFixed(2)}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h6">
                  {calculateTotal("totalPayment").toFixed(2)}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h6">
                  {calculateTotal("creditPayment").toFixed(2)}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h6">
                  {calculateTotal("totalDuePayment").toFixed(2)}
                </Typography>
              </TableCell>
            </TableRow>

            {/* New Feature: Lifting Weight, Cash Count, and Expenses */}
            <TableRow>
              <TableCell colSpan={9}>
                <Box
                  mt={4}
                  sx={{
                    display: "flex",
                    gap: 2,
                    flexDirection: "column",
                    width: "100%",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    {/* Lifting Weight */}
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2">
                          Lifting Weight
                        </Typography>
                        <TextareaAutosize
                      minRows={3}
                      placeholder="Enter Lifting Weight"
                      value={liftingWeight}
                      onChange={(e) => setLiftingWeight(e.target.value)}
                      style={{
                        width: "90%",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        padding: "8px",
                      }}
                    >

                    </TextareaAutosize>
                        
                        <Typography variant="subtitle2" sx={{ mt: 1 }}>
                          Lifting Rate: ₹ {liftingRate || 0}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2">Expenses</Typography>
                        <TextareaAutosize
                          minRows={3}
                          placeholder="Enter expenses..."
                          value={expenses}
                          onChange={(e) => setExpenses(e.target.value)}
                          style={{
                            width: "50%",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            padding: "8px",
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Collected Cash */}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2">
                        Collected Cash
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                        {["500", "200", "100", "050", "020", "010"].map(
                          (denomination, index) => (
                            <Box
                              key={denomination}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                width: "calc(33% - 10px)",
                              }}
                            >
                              <Typography>{denomination}:</Typography>
                              <TextField
                                type="number"
                                placeholder="Count"
                                value={cashCounts[denomination] || ""}
                                onChange={(e) =>
                                  setCashCounts((prev) => ({
                                    ...prev,
                                    [denomination]: e.target.value,
                                  }))
                                }
                                sx={{ width: "7em","& input[type=number]::-webkit-inner-spin-button": {
                        display: "none",
                      },
                      "& input[type=number]::-webkit-outer-spin-button": {
                        display: "none",
                      },
                      "-moz-appearance": "textfield", }}
                              />
                            </Box>
                          )
                        )}
                      </Box>
                      <Typography variant="h6" sx={{ mt: 2 }}>
                        Total Cash: ₹{" "}
                        {Object.entries(cashCounts).reduce(
                          (sum, [denomination, count]) =>
                            sum +
                            parseInt(denomination) * (parseInt(count) || 0),
                          0
                        )}
                      </Typography>
                    </Box>

                    {/* Expenses */}
                  </Box>

                  {/* Notes Section */}
                  <Box sx={{ width: "100%", mt: 2 }}>
                    <Typography variant="subtitle2">Daily Note</Typography>
                    <TextareaAutosize
                      minRows={3}
                      placeholder="Enter any notes for the day..."
                      value={dailyNote}
                      onChange={(e) => setDailyNote(e.target.value)}
                      style={{
                        width: "90%",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        padding: "8px",
                      }}
                    />
                  </Box>
                </Box>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell colSpan={9} align="center">
                <Button variant="contained" color="success" onClick={saveBill}>
                  Save Bill
                </Button>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
      <ToastContainer />
    </Box>
  );
};

export default TodaysBills;
