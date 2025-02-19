import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Chip,
  Tabs,
  Tab,
} from "@mui/material";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import useAxiosPrivate from "../hooks/useAxiosPrivate";

const UniversityReadUpdatePage = () => {
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const { id } = useParams();
  const { state } = useLocation();
  const universityData = state?.data;

  const [formValues, setFormValues] = useState({
    brand: "",
    model: "",
    year: "",
    mileage: "",
    price: "",
    fuelType: "",
    condition: "Новый",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handleCancel = (e) => {
    navigate(`/dashboard`);
  };

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setImages((prevImages) => [...prevImages, ...files]);
    setPreviews((prevPreviews) => [
      ...prevPreviews,
      ...files.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const handleRemoveFile = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    setPreviews((prevPreviews) => prevPreviews.filter((_, i) => i !== index));
  };

  const logCurrentFiles = () => {
    console.log("Final images:", images);
    console.log("Final previews:", previews);
  };

  const handleCommentsChange = (index, value) => {
    const updatedComments = [...formValues.comments];
    updatedComments[index] = value;
    setFormValues({
      ...formValues,
      comments: updatedComments,
    });
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handleTuitionFeeChange = (e, newValue) => {
    setFormValues({
      ...formValues,
      tuition_fee: newValue,
    });
  };

  const handleLivingCostChange = (e, newValue) => {
    setFormValues({
      ...formValues,
      living_cost: newValue,
    });
  };

  // const handleSaveChanges = async () => {
  //   const payload = {
  //     brand: formValues.brand,
  //     model: formValues.model,
  //     year: formValues.year,
  //     mileage: formValues.mileage,
  //     price: formValues.price,
  //     fuelType: formValues.fuelType,
  //     condition: formValues.condition
  //   };
  //
  //   console.log('payload', payload);
  //   try {
  //     await axiosPrivate.post(`/cars`, payload, {
  //       headers: {
  //         'Content-Type': 'application/json'
  //       }
  //     });
  //     toast.success('Новая машина успешно создана!', {
  //       position: "top-right",
  //       autoClose: 3000
  //     });
  //     setTimeout(() => {
  //       navigate('/dashboard');
  //     }, 3000);
  //   } catch (error) {
  //     toast.error('Ошибка при создании машины. Попробуйте снова.', {
  //       position: "top-right",
  //       autoClose: 3000
  //     });
  //     console.error('Error updating university:', error);
  //   }
  // };
  const handleSaveChanges = async () => {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append("files", image);
    });
    formData.append("brand", formValues.brand);
    formData.append("model", formValues.model);
    formData.append("year", formValues.year);
    formData.append("mileage", formValues.mileage);
    formData.append("price", formValues.price);
    formData.append("fuelType", formValues.fuelType);
    formData.append("condition", formValues.condition);

    console.log("FormData payload:", formData);
    try {
      await axiosPrivate.post(`/cars`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Новая машина успешно создана!", {
        position: "top-right",
        autoClose: 3000,
      });
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    } catch (error) {
      toast.error("Ошибка при создании машины. Попробуйте снова.", {
        position: "top-right",
        autoClose: 3000,
      });
      console.error("Error creating car:", error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Создать новую машину
        </Typography>
        <Box sx={{ mt: 3 }}>
          <>
            <Typography variant="h6" gutterBottom>
              Parameters:
            </Typography>
            <TextField
              fullWidth
              name="brand"
              label="Brand"
              value={formValues.brand}
              onChange={handleInputChange}
              margin="normal"
            />
            <TextField
              label="Model"
              margin="normal"
              fullWidth
              name="model"
              value={formValues.model}
              onChange={handleInputChange}
            />
            <TextField
              label="Year"
              margin="normal"
              fullWidth
              name="year"
              value={formValues.year}
              onChange={handleInputChange}
            />
            <TextField
              label="Mileage"
              margin="normal"
              fullWidth
              name="mileage"
              value={formValues.mileage}
              onChange={handleInputChange}
            />
            <TextField
              label="Price"
              margin="normal"
              fullWidth
              name="price"
              value={formValues.price}
              onChange={handleInputChange}
            />
            <TextField
              label="Fuel type"
              margin="normal"
              fullWidth
              name="fuelType"
              value={formValues.fuelType}
              onChange={handleInputChange}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Condition</InputLabel>
              <Select
                name="condition"
                value={formValues.condition}
                onChange={handleInputChange}
              >
                <MenuItem value="new">Новый</MenuItem>
                <MenuItem value="used">Б/У</MenuItem>
              </Select>
            </FormControl>

            <Paper sx={{ p: 3 }}>
              <div
                style={{
                  borderRadius: "15px",
                  minHeight: "200px",
                  padding: "20px",
                  width: "450px",
                }}
              >
                <div>
                  <Typography sx={{ p: 1, fontSize: "20px" }}>
                    Добавить изображения:
                  </Typography>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                />
                <div>
                  {previews.map((preview, index) => (
                    <div
                      key={index}
                      style={{
                        overflow: "hidden",
                        width: "400px",
                        height: "300px",
                      }}
                    >
                      <img
                        src={preview}
                        alt="Preview"
                        style={{
                          width: "100%",
                          height: "auto",
                          objectFit: "cover",
                          border: "1px solid lightgray",
                          borderRadius: "15px",
                          padding: "10px",
                        }}
                      />
                      <button
                        style={{
                          backgroundColor: "indianred",
                          color: "white",
                          fontSize: "15px",
                          fontWeight: "200",
                          border: "none",
                          borderRadius: "5px",
                          padding: "10px",
                          width: "400px",
                          height: "40px",
                        }}
                        onClick={() => handleRemoveFile(index)}
                      >
                        "Удалить"
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </Paper>
            {/*<div style={{border: "1px solid lightgray", padding: "5px 20px 20px 20px", marginTop: "20px", marginBottom: "40px", display: "flex", flexDirection: "column", width: "400px"}}>*/}
            {/*  <Typography variant="h7" sx={{marginBottom: "10px"}}>*/}
            {/*    Добавить фото:*/}
            {/*  </Typography>*/}
            {/*  <input type="file" accept="image/*" multiple onChange={handleFileChange}/>*/}
            {/*  <div className="flex gap-2">*/}
            {/*    {previews.map((preview, index) => (*/}
            {/*        <div key={index} style={{width:'300px', height: '200px', border: "1px solid lightgray", padding: "10px", marginTop: "10px"}}>*/}
            {/*          <img src={preview} alt="Preview" style={{width: "100%", height: "auto"}}/>*/}
            {/*          <button*/}
            {/*              className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full p-1"*/}
            {/*              onClick={() => handleRemoveFile(index)}*/}
            {/*          >*/}
            {/*            ✕*/}
            {/*          </button>*/}
            {/*        </div>*/}
            {/*    ))}*/}
            {/*  </div>*/}
            {/*</div>*/}
          </>
        </Box>
        <Box sx={{ mt: 3, justifyContent: "space-between", display: "flex" }}>
          <Button
            variant="outlined"
            color="secondary"
            sx={{ mr: 2 }}
            onClick={handleCancel}
          >
            Отменить
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleSaveChanges}
          >
            Сохранить
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default UniversityReadUpdatePage;
