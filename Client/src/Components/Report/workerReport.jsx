import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Navbar/Navbar";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Button,
  Stack,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { BACKEND_SERVER_URL } from "../../../Config/config";
import styles from "../LotProcess/FilingProcess/FilingLotDetails.module.css";

const ProcessReport = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    processType: "casting",
    fromDate: null,
    toDate: null,
  });
  const [selectedPerson, setSelectedPerson] = useState("");
  const [persons, setPersons] = useState([]);
  const [allEntries, setAllEntries] = useState([]);
  const [wastageData, setWastageData] = useState({});

  const processTypes = [
    { value: "casting", label: "Casting" },
    { value: "filing", label: "Filing" },
    { value: "setting", label: "Setting" },
    { value: "buffing", label: "Buffing" },
  ];

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (filters.processType) {
        params.append("processType", filters.processType);
      }

      if (filters.fromDate) {
        params.append("fromDate", filters.fromDate.toISOString().split("T")[0]);
      }

      if (filters.toDate) {
        params.append("toDate", filters.toDate.toISOString().split("T")[0]);
      }

      const response = await axios.get(
        `${BACKEND_SERVER_URL}/api/filingentry/process-entries?${params.toString()}`
      );
      setEntries(response.data);
      setAllEntries(response.data);

      // Extract unique persons based on process type
      const uniquePersons = [];
      response.data.forEach((entry) => {
        let personName = "";
        if (entry.processType === "casting" && entry.customer?.name) {
          personName = entry.customer.name;
        } else if (entry.processType === "filing" && entry.filing_person_name) {
          personName = entry.filing_person_name;
        } else if (
          entry.processType === "setting" &&
          entry.setting_person_name
        ) {
          personName = entry.setting_person_name;
        } else if (
          entry.processType === "buffing" &&
          entry.buffing_person_name
        ) {
          personName = entry.buffing_person_name;
        }

        if (personName && !uniquePersons.includes(personName)) {
          uniquePersons.push(personName);
        }
      });

      setPersons(uniquePersons);

      // Fetch wastage data for filing, setting, and buffing processes
      if (filters.processType !== "casting") {
        fetchWastageData(response.data);
      }
    } catch (error) {
      console.error("Error fetching entries:", error);
      alert("Failed to fetch entries");
    } finally {
      setLoading(false);
    }
  };

  const fetchWastageData = async (entriesData) => {
    try {
      const wastagePromises = entriesData.map(async (entry) => {
        let lotNumber = "";
        let personId = "";

        // Extract lot number and person ID based on process type
        if (
          entry.processType === "filing" &&
          entry.lotFilingMapper &&
          entry.lotFilingMapper.length > 0
        ) {
          lotNumber = entry.lotFilingMapper[0].lot_number;
          personId = entry.filing_person_id;
        } else if (
          entry.processType === "setting" &&
          entry.lotSettingMapper &&
          entry.lotSettingMapper.length > 0
        ) {
          lotNumber = entry.lotSettingMapper[0].lot_number;
          personId = entry.setting_person_id;
        } else if (
          entry.processType === "buffing" &&
          entry.lotBuffingMapper &&
          entry.lotBuffingMapper.length > 0
        ) {
          lotNumber = entry.lotBuffingMapper[0].lot_number;
          personId = entry.buffing_person_id;
        }

        if (lotNumber && personId) {
          let url = "";

          if (entry.processType === "filing") {
            url = `${BACKEND_SERVER_URL}/api/filingitems/entry/${personId}/${lotNumber}`;
          } else if (entry.processType === "setting") {
            url = `${BACKEND_SERVER_URL}/api/settingentry/person/${personId}/${lotNumber}`;
          } else if (entry.processType === "buffing") {
            url = `${BACKEND_SERVER_URL}/api/buffing/entry/${personId}/${lotNumber}`;
          }

          if (url) {
            const response = await axios.get(url);
            if (response.data && response.data.length > 0) {
              return {
                lotNumber: lotNumber,
                wastageData: response.data[0],
              };
            }
          }
        }
        return null;
      });

      const wastageResults = await Promise.all(wastagePromises);
      const wastageMap = {};

      wastageResults.forEach((result) => {
        if (result) {
          wastageMap[result.lotNumber] = result.wastageData;
        }
      });

      setWastageData(wastageMap);
    } catch (error) {
      console.error("Error fetching wastage data:", error);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [filters]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePersonFilter = () => {
    if (!selectedPerson) {
      setEntries(allEntries);
      return;
    }

    const filtered = allEntries.filter((entry) => {
      if (
        entry.processType === "casting" &&
        entry.customer?.name === selectedPerson
      ) {
        return true;
      } else if (
        entry.processType === "filing" &&
        entry.filing_person_name === selectedPerson
      ) {
        return true;
      } else if (
        entry.processType === "setting" &&
        entry.setting_person_name === selectedPerson
      ) {
        return true;
      } else if (
        entry.processType === "buffing" &&
        entry.buffing_person_name === selectedPerson
      ) {
        return true;
      }
      return false;
    });

    setEntries(filtered);
  };

  const handleReset = () => {
    setFilters({
      processType: "casting",
      fromDate: null,
      toDate: null,
    });
    setSelectedPerson("");
    setEntries(allEntries);
    setWastageData({});
  };

  const getProcessColor = (processType) => {
    const colors = {
      casting: "primary",
      filing: "secondary",
      setting: "success",
      buffing: "warning",
    };
    return colors[processType] || "default";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString();
  };

  const calculateTotals = () => {
    const totals = {
      castingWeight: 0,
      filingWeight: 0,
      settingWeight: 0,
      buffingWeight: 0,
      productWeight: 0,
      scrapWeight: 0,
      wastage: 0,
      balance: 0,
    };

    entries.forEach((entry) => {
      if (entry.processType === "casting") {
        totals.castingWeight += entry.totalItemWeight || 0;
        totals.scrapWeight += entry.totalScrapWeight || 0;
      } else if (entry.processType === "filing") {
        totals.filingWeight += entry.casting_item_weight || 0;
        if (entry.filingTotalBalance && entry.filingTotalBalance.length > 0) {
          const balance = entry.filingTotalBalance[0];
          totals.productWeight += balance.total_product_weight || 0;
          totals.scrapWeight += balance.total_scrap_weight || 0;
          totals.wastage += balance.wastage ? 1 : 0;
          totals.balance += balance.balance || 0;
        }
      } else if (entry.processType === "setting") {
        totals.settingWeight += entry.casting_item_weight || 0;
        if (entry.settingTotalBalance && entry.settingTotalBalance.length > 0) {
          const balance = entry.settingTotalBalance[0];
          totals.productWeight += balance.total_product_weight || 0;
          totals.scrapWeight += balance.total_scrap_weight || 0;
          totals.wastage += balance.wastage ? 1 : 0;
          totals.balance += balance.balance || 0;
        }
      } else if (entry.processType === "buffing") {
        totals.buffingWeight += entry.casting_item_weight || 0;
        if (entry.buffingTotalBalance && entry.buffingTotalBalance.length > 0) {
          const balance = entry.buffingTotalBalance[0];
          totals.productWeight += balance.total_product_weight || 0;
          totals.scrapWeight += balance.total_scrap_weight || 0;
          totals.wastage += balance.wastage ? 1 : 0;
          totals.balance += balance.balance || 0;
        }
      }
    });

    return totals;
  };

  const totals = calculateTotals();

  // Group entries by lot number for non-casting processes
  const groupEntriesByLot = () => {
    if (filters.processType === "casting") {
      return { "": entries }; // No lot grouping for casting
    }

    const grouped = {};

    entries.forEach((entry) => {
      let lotNumber = "Unknown Lot";

      // Extract lot number based on process type
      if (
        entry.processType === "filing" &&
        entry.lotFilingMapper &&
        entry.lotFilingMapper.length > 0
      ) {
        lotNumber = entry.lotFilingMapper[0].lot_number || "Unknown Lot";
      } else if (
        entry.processType === "setting" &&
        entry.lotSettingMapper &&
        entry.lotSettingMapper.length > 0
      ) {
        lotNumber = entry.lotSettingMapper[0].lot_number || "Unknown Lot";
      } else if (
        entry.processType === "buffing" &&
        entry.lotBuffingMapper &&
        entry.lotBuffingMapper.length > 0
      ) {
        lotNumber = entry.lotBuffingMapper[0].lot_number || "Unknown Lot";
      }

      if (!grouped[lotNumber]) {
        grouped[lotNumber] = [];
      }
      grouped[lotNumber].push(entry);
    });

    return grouped;
  };

  const renderCastingRow = (entry, index) => {
    return (
      <TableRow key={`casting-${entry.id}`}>
        <TableCell>{index + 1}</TableCell>
        <TableCell>{formatDate(entry.createdAt)}</TableCell>
        <TableCell>{formatTime(entry.createdAt)}</TableCell>
        <TableCell>
          <Chip
            label={entry.processType.toUpperCase()}
            color={getProcessColor(entry.processType)}
            size="small"
          />
        </TableCell>
        <TableCell>{entry.customer?.name || "-"}</TableCell>
        <TableCell>{entry.productItems.join(", ") || "-"}</TableCell>
        <TableCell>{entry.totalItemWeight?.toFixed(2) || "0.00"}</TableCell>
        <TableCell colSpan={6}>-</TableCell>
        <TableCell>{entry.totalItemWeight?.toFixed(2) || "0.00"}</TableCell>
        <TableCell>{entry.totalScrapWeight?.toFixed(2) || "0.00"}</TableCell>
        <TableCell>{entry.totalWastage?.toFixed(2) || "0.00"}</TableCell>
        <TableCell>
          {entry.currentBalanceWeight?.toFixed(2) || "0.00"}
        </TableCell>
      </TableRow>
    );
  };

  const renderFilingRow = (entry, index) => {
    const balanceData = entry.filingTotalBalance?.[0] || {};
    const filingItems = entry.filingItems || [];

    if (filingItems.length === 0) {
      return (
        <TableRow key={`filing-${entry.id}`}>
          <TableCell>{index + 1}</TableCell>
          <TableCell>{formatDate(entry.createdAt)}</TableCell>
          <TableCell>{formatTime(entry.createdAt)}</TableCell>
          <TableCell>
            <Chip
              label={entry.processType.toUpperCase()}
              color={getProcessColor(entry.processType)}
              size="small"
            />
          </TableCell>
          <TableCell>{entry.filing_person_name || "-"}</TableCell>
          <TableCell>{entry.item_name || "-"}</TableCell>
          <TableCell>
            {entry.casting_item_weight
              ? entry.casting_item_weight.toFixed(2)
              : "0.00"}
          </TableCell>
          <TableCell colSpan={6}>-</TableCell>
          <TableCell>
            {balanceData.total_product_weight
              ? balanceData.total_product_weight.toFixed(2)
              : "0.00"}
          </TableCell>
          <TableCell>
            {balanceData.total_scrap_weight
              ? balanceData.total_scrap_weight.toFixed(2)
              : "0.00"}
          </TableCell>
          <TableCell>
            {balanceData.wastage != null
              ? balanceData.wastage === true
                ? "Yes"
                : "No"
              : "-"}
          </TableCell>
          <TableCell>
            {balanceData.balance ? balanceData.balance.toFixed(2) : "0.00"}
          </TableCell>
        </TableRow>
      );
    }

    return filingItems.map((item, itemIndex) => (
      <TableRow key={`filing-${entry.id}-${itemIndex}`}>
        {itemIndex === 0 && (
          <>
            <TableCell rowSpan={filingItems.length}>{index + 1}</TableCell>
            <TableCell rowSpan={filingItems.length}>
              {formatDate(entry.createdAt)}
            </TableCell>
            <TableCell rowSpan={filingItems.length}>
              {formatTime(entry.createdAt)}
            </TableCell>
            <TableCell rowSpan={filingItems.length}>
              <Chip
                label={entry.processType.toUpperCase()}
                color={getProcessColor(entry.processType)}
                size="small"
              />
            </TableCell>
            <TableCell rowSpan={filingItems.length}>
              {entry.filing_person_name || "-"}
            </TableCell>
            <TableCell rowSpan={filingItems.length}>
              {entry.item_name || "-"}
            </TableCell>
            <TableCell rowSpan={filingItems.length}>
              {entry.casting_item_weight
                ? entry.casting_item_weight.toFixed(2)
                : "0.00"}
            </TableCell>
          </>
        )}
        <TableCell>{item?.filingitem?.name || "-"}</TableCell>
        <TableCell>{item?.item_purity || "-"}</TableCell>
        <TableCell>{item?.touch?.touch || "-"}</TableCell>
        <TableCell>{item?.type || "-"}</TableCell>
        <TableCell>
          {item?.stone_option === "WithStone" ? "Yes" : "No"}
        </TableCell>
        <TableCell>
          {item?.stone_option === "WithStone" ? "Setting" : "Buffing"}
        </TableCell>
        {itemIndex === 0 && (
          <>
            <TableCell rowSpan={filingItems.length}>
              {balanceData.total_product_weight
                ? balanceData.total_product_weight.toFixed(2)
                : "0.00"}
            </TableCell>
            <TableCell rowSpan={filingItems.length}>
              {balanceData.total_scrap_weight
                ? balanceData.total_scrap_weight.toFixed(2)
                : "0.00"}
            </TableCell>
            <TableCell rowSpan={filingItems.length}>
              {balanceData.wastage != null
                ? balanceData.wastage === true
                  ? "Yes"
                  : "No"
                : "-"}
            </TableCell>
            <TableCell rowSpan={filingItems.length}>
              {balanceData.balance ? balanceData.balance.toFixed(2) : "0.00"}
            </TableCell>
          </>
        )}
      </TableRow>
    ));
  };

  const renderSettingRow = (entry, index) => {
    const balanceData = entry.settingTotalBalance?.[0] || {};
    const settingItems = entry.settingItems || [];

    if (settingItems.length === 0) {
      return (
        <TableRow key={`setting-${entry.id}`}>
          <TableCell>{index + 1}</TableCell>
          <TableCell>{formatDate(entry.createdAt)}</TableCell>
          <TableCell>{formatTime(entry.createdAt)}</TableCell>
          <TableCell>
            <Chip
              label={entry.processType.toUpperCase()}
              color={getProcessColor(entry.processType)}
              size="small"
            />
          </TableCell>
          <TableCell>{entry.setting_person_name || "-"}</TableCell>
          <TableCell>{entry.item_name || "-"}</TableCell>
          <TableCell>
            {entry.casting_item_weight
              ? entry.casting_item_weight.toFixed(2)
              : "0.00"}
          </TableCell>
          <TableCell colSpan={6}>-</TableCell>
          <TableCell>
            {balanceData.total_product_weight
              ? balanceData.total_product_weight.toFixed(2)
              : "0.00"}
          </TableCell>
          <TableCell>
            {balanceData.total_scrap_weight
              ? balanceData.total_scrap_weight.toFixed(2)
              : "0.00"}
          </TableCell>
          <TableCell>
            {balanceData.wastage != null
              ? balanceData.wastage === true
                ? "Yes"
                : "No"
              : "-"}
          </TableCell>
          <TableCell>
            {balanceData.balance ? balanceData.balance.toFixed(2) : "0.00"}
          </TableCell>
        </TableRow>
      );
    }

    return settingItems.map((item, itemIndex) => (
      <TableRow key={`setting-${entry.id}-${itemIndex}`}>
        {itemIndex === 0 && (
          <>
            <TableCell rowSpan={settingItems.length}>{index + 1}</TableCell>
            <TableCell rowSpan={settingItems.length}>
              {formatDate(entry.createdAt)}
            </TableCell>
            <TableCell rowSpan={settingItems.length}>
              {formatTime(entry.createdAt)}
            </TableCell>
            <TableCell rowSpan={settingItems.length}>
              <Chip
                label={entry.processType.toUpperCase()}
                color={getProcessColor(entry.processType)}
                size="small"
              />
            </TableCell>
            <TableCell rowSpan={settingItems.length}>
              {entry.setting_person_name || "-"}
            </TableCell>
            <TableCell rowSpan={settingItems.length}>
              {entry.item_name || "-"}
            </TableCell>
            <TableCell rowSpan={settingItems.length}>
              {entry.casting_item_weight
                ? entry.casting_item_weight.toFixed(2)
                : "0.00"}
            </TableCell>
          </>
        )}
        <TableCell>{item?.item?.name || "-"}</TableCell>
        <TableCell>{item?.item_purity || "-"}</TableCell>
        <TableCell>{item?.touch?.touch || "-"}</TableCell>
        <TableCell>{item?.type || "-"}</TableCell>
        <TableCell>-</TableCell>
        <TableCell>Buffing</TableCell>
        {itemIndex === 0 && (
          <>
            <TableCell rowSpan={settingItems.length}>
              {balanceData.total_product_weight
                ? balanceData.total_product_weight.toFixed(2)
                : "0.00"}
            </TableCell>
            <TableCell rowSpan={settingItems.length}>
              {balanceData.total_scrap_weight
                ? balanceData.total_scrap_weight.toFixed(2)
                : "0.00"}
            </TableCell>
            <TableCell rowSpan={settingItems.length}>
              {balanceData.wastage != null
                ? balanceData.wastage === true
                  ? "Yes"
                  : "No"
                : "-"}
            </TableCell>
            <TableCell rowSpan={settingItems.length}>
              {balanceData.balance ? balanceData.balance.toFixed(2) : "0.00"}
            </TableCell>
          </>
        )}
      </TableRow>
    ));
  };

  const renderBuffingRow = (entry, index) => {
    const balanceData = entry.buffingTotalBalance?.[0] || {};
    const buffingItems = entry.buffingItems || [];

    if (buffingItems.length === 0) {
      return (
        <TableRow key={`buffing-${entry.id}`}>
          <TableCell>{index + 1}</TableCell>
          <TableCell>{formatDate(entry.createdAt)}</TableCell>
          <TableCell>{formatTime(entry.createdAt)}</TableCell>
          <TableCell>
            <Chip
              label={entry.processType.toUpperCase()}
              color={getProcessColor(entry.processType)}
              size="small"
            />
          </TableCell>
          <TableCell>{entry.buffing_person_name || "-"}</TableCell>
          <TableCell>{entry.item_name || "-"}</TableCell>
          <TableCell>
            {entry.casting_item_weight
              ? entry.casting_item_weight.toFixed(2)
              : "0.00"}
          </TableCell>
          <TableCell colSpan={6}>-</TableCell>
          <TableCell>
            {balanceData.total_product_weight
              ? balanceData.total_product_weight.toFixed(2)
              : "0.00"}
          </TableCell>
          <TableCell>
            {balanceData.total_scrap_weight
              ? balanceData.total_scrap_weight.toFixed(2)
              : "0.00"}
          </TableCell>
          <TableCell>
            {balanceData.wastage != null
              ? balanceData.wastage === true
                ? "Yes"
                : "No"
              : "-"}
          </TableCell>
          <TableCell>
            {balanceData.balance ? balanceData.balance.toFixed(2) : "0.00"}
          </TableCell>
        </TableRow>
      );
    }

    return buffingItems.map((item, itemIndex) => (
      <TableRow key={`buffing-${entry.id}-${itemIndex}`}>
        {itemIndex === 0 && (
          <>
            <TableCell rowSpan={buffingItems.length}>{index + 1}</TableCell>
            <TableCell rowSpan={buffingItems.length}>
              {formatDate(entry.createdAt)}
            </TableCell>
            <TableCell rowSpan={buffingItems.length}>
              {formatTime(entry.createdAt)}
            </TableCell>
            <TableCell rowSpan={buffingItems.length}>
              <Chip
                label={entry.processType.toUpperCase()}
                color={getProcessColor(entry.processType)}
                size="small"
              />
            </TableCell>
            <TableCell rowSpan={buffingItems.length}>
              {entry.buffing_person_name || "-"}
            </TableCell>
            <TableCell rowSpan={buffingItems.length}>
              {entry.item_name || "-"}
            </TableCell>
            <TableCell rowSpan={buffingItems.length}>
              {entry.casting_item_weight
                ? entry.casting_item_weight.toFixed(2)
                : "0.00"}
            </TableCell>
          </>
        )}
        <TableCell>{item?.item?.name || "-"}</TableCell>
        <TableCell>{item?.item_purity || "-"}</TableCell>
        <TableCell>{item?.touch?.touch || "-"}</TableCell>
        <TableCell>{item?.type || "-"}</TableCell>
        <TableCell>-</TableCell>
        <TableCell>Finished</TableCell>
        {itemIndex === 0 && (
          <>
            <TableCell rowSpan={buffingItems.length}>
              {balanceData.total_product_weight
                ? balanceData.total_product_weight.toFixed(2)
                : "0.00"}
            </TableCell>
            <TableCell rowSpan={buffingItems.length}>
              {balanceData.total_scrap_weight
                ? balanceData.total_scrap_weight.toFixed(2)
                : "0.00"}
            </TableCell>
            <TableCell rowSpan={buffingItems.length}>
              {balanceData.wastage != null
                ? balanceData.wastage === true
                  ? "Yes"
                  : "No"
                : "-"}
            </TableCell>
            <TableCell rowSpan={buffingItems.length}>
              {balanceData.balance ? balanceData.balance.toFixed(2) : "0.00"}
            </TableCell>
          </>
        )}
      </TableRow>
    ));
  };

  const renderTableRow = (entry, index) => {
    switch (entry.processType) {
      case "casting":
        return renderCastingRow(entry, index);
      case "filing":
        return renderFilingRow(entry, index);
      case "setting":
        return renderSettingRow(entry, index);
      case "buffing":
        return renderBuffingRow(entry, index);
      default:
        return null;
    }
  };

  const renderWastageRow = (lotNumber) => {
    const wastage = wastageData[lotNumber];

    console.log("Wastage for lot", lotNumber, ":", wastage);
    if (!wastage) return null;

    return (
      <TableRow className={styles.wastageRow}>
        <TableCell
          colSpan={2}
          style={{ fontWeight: "bold", textAlign: "right" }}
        >
          Wastage for Lot {lotNumber}:
        </TableCell>
        <TableCell colSpan={2} style={{ fontWeight: "bold" }}>
          Given Gold: {wastage.given_gold || 0}
        </TableCell>
        <TableCell colSpan={2} style={{ fontWeight: "bold" }}>
          Opening Balance:{" "}
          {wastage.opening_balance ? wastage.opening_balance.toFixed(2) : 0}
        </TableCell>
        <TableCell colSpan={2} style={{ fontWeight: "bold" }}>
          Percentage: {wastage.wastage_percentage || 0}%
        </TableCell>
        <TableCell colSpan={2} style={{ fontWeight: "bold" }}>
          Add -On Wastage:{" "}
          {wastage.add_wastage ? wastage.add_wastage.toFixed(2) : 0}
        </TableCell>
        <TableCell colSpan={2} style={{ fontWeight: "bold" }}>
          Total Receipt:{" "}
          {wastage.total_receipt ? wastage.total_receipt.toFixed(2) : 0}
        </TableCell>
        <TableCell colSpan={2} style={{ fontWeight: "bold" }}>
          Balance: {wastage.balance ? wastage.balance.toFixed(2) : 0}
        </TableCell>
        <TableCell colSpan={2} style={{ fontWeight: "bold" }}>
          Total Wastage:{" "}
          {wastage.total_wastage ? wastage.total_wastage.toFixed(2) : 0}
        </TableCell>
        <TableCell colSpan={2} style={{ fontWeight: "bold" }}>
          Closing Balance:{" "}
          {wastage.closing_balance ? wastage.closing_balance.toFixed(2) : 0}
        </TableCell>
      </TableRow>
    );
  };

  const groupedEntries = groupEntriesByLot();

  return (
    <>
      <Navbar />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box sx={{ p: 3 }}>
          <center>
          <Typography variant="h5" gutterBottom>
            Worker Process Report
          </Typography>
          </center>

          {/* Filters */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <InputLabel>Process Type</InputLabel>
                    <Select
                      value={filters.processType}
                      label="Process Type"
                      onChange={(e) =>
                        handleFilterChange("processType", e.target.value)
                      }
                    >
                      {processTypes.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <DatePicker
                    label="From Date"
                    value={filters.fromDate}
                    onChange={(date) => handleFilterChange("fromDate", date)}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <DatePicker
                    label="To Date"
                    value={filters.toDate}
                    onChange={(date) => handleFilterChange("toDate", date)}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl sx={{width:'10rem'}}>
                    <InputLabel>Person</InputLabel>
                    <Select
                      value={selectedPerson}
                      label="Person"
                      onChange={(e) => setSelectedPerson(e.target.value)}
                    >
                      <MenuItem value="">All Persons</MenuItem>
                      {persons.map((person, idx) => (
                        <MenuItem key={idx} value={person}>
                          {person}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      onClick={handlePersonFilter}
                      disabled={!selectedPerson}
                    >
                      Filter Person
                    </Button>
                    <Button variant="outlined" onClick={handleReset}>
                      Reset
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Summary Section */}
          <div className={styles.summarySection}>
            <h4>Summary</h4>
            <div className={styles.summaryGrid}>
              {filters.processType === "casting" && (
                <>
                  <div className={styles.summaryItem}>
                    <span>Total Casting Weight:</span>
                    <span>{totals.castingWeight.toFixed(2)}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>Total Product Weight:</span>
                    <span>{totals.productWeight.toFixed(2)}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>Total Scrap Weight:</span>
                    <span>{totals.scrapWeight.toFixed(2)}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>Total Wastage Entries:</span>
                    <span>{totals.wastage}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>Total Balance:</span>
                    <span>{totals.balance.toFixed(2)}</span>
                  </div>
                </>
              )}
              {filters.processType === "filing" && (
                <>
                  <div className={styles.summaryItem}>
                    <span>Total Filing Weight:</span>
                    <span>{totals.filingWeight.toFixed(2)}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>Total Product Weight:</span>
                    <span>{totals.productWeight.toFixed(2)}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>Total Scrap Weight:</span>
                    <span>{totals.scrapWeight.toFixed(2)}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>Total Wastage Entries:</span>
                    <span>{totals.wastage}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>Total Balance:</span>
                    <span>{totals.balance.toFixed(2)}</span>
                  </div>
                </>
              )}
              {filters.processType === "setting" && (
                <>
                  <div className={styles.summaryItem}>
                    <span>Total Setting Weight:</span>
                    <span>{totals.settingWeight.toFixed(2)}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>Total Product Weight:</span>
                    <span>{totals.productWeight.toFixed(2)}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>Total Scrap Weight:</span>
                    <span>{totals.scrapWeight.toFixed(2)}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>Total Wastage Entries:</span>
                    <span>{totals.wastage}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>Total Balance:</span>
                    <span>{totals.balance.toFixed(2)}</span>
                  </div>
                </>
              )}
              {filters.processType === "buffing" && (
                <>
                  <div className={styles.summaryItem}>
                    <span>Total Buffing Weight:</span>
                    <span>{totals.buffingWeight.toFixed(2)}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>Total Product Weight:</span>
                    <span>{totals.productWeight.toFixed(2)}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>Total Scrap Weight:</span>
                    <span>{totals.scrapWeight.toFixed(2)}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>Total Wastage Entries:</span>
                    <span>{totals.wastage}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>Total Balance:</span>
                    <span>{totals.balance.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="200px"
            >
              <CircularProgress />
            </Box>
          ) : (
            <div className={styles.itemList}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th rowSpan={2}>S.No</th>
                    <th rowSpan={2}>Date</th>
                    <th rowSpan={2}>Time</th>
                    <th rowSpan={2}>Process</th>
                    <th rowSpan={2}>Person</th>
                    <th rowSpan={2}>Item</th>
                    <th rowSpan={2}>Weight</th>
                    <th colSpan={6}>Process Items</th>
                    <th rowSpan={2}>Product Weight</th>
                    <th rowSpan={2}>Scrap Weight</th>
                    <th rowSpan={2}>Wastage</th>
                    <th rowSpan={2}>Balance</th>
                  </tr>
                  <tr>
                    <th>Name</th>
                    <th>Purity</th>
                    <th>Touch</th>
                    <th>Type</th>
                    <th>Has Stone</th>
                    <th>Next Process</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(groupedEntries).map((lotNumber) => (
                    <React.Fragment key={lotNumber}>
                      {lotNumber && lotNumber !== "" && (
                        <tr className={styles.lotHeader}>
                          <td
                            colSpan="15"
                            style={{
                              fontWeight: "bold",
                              backgroundColor: "#f0f0f0",
                            }}
                          >
                            Lot {lotNumber}
                          </td>
                        </tr>
                      )}
                      {groupedEntries[lotNumber].map((entry, index) =>
                        renderTableRow(entry, index)
                      )}
                      {lotNumber &&
                        lotNumber !== "" &&
                        wastageData[lotNumber] &&
                        renderWastageRow(lotNumber)}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Box>
      </LocalizationProvider>
    </>
  );
};

export default ProcessReport;
