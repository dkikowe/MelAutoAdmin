import React, { useState, useEffect } from 'react';
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
  Tab
} from '@mui/material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import {between} from "react-table/src/filterTypes";

const UniversityReadUpdatePage = () => {
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const { id } = useParams();
  const { state } = useLocation();
  const universityData = state?.data;




  const [formValues, setFormValues] = useState({
    id: universityData._id,
    brand: universityData.brand,
    model: universityData.model,
    year: universityData.year,
    mileage: universityData.mileage,
    price: universityData.price,
    fuelType: universityData.fuelType,
    condition: universityData.condition,
    images: universityData.images,
    imageUrls:  universityData.imageUrls
        ? universityData.imageUrls.map((image) => ({ ...image, delete: false }))
        : "no images",
  });

  console.log(formValues.imageUrls);

  const [previews, setPreviews] = useState(formValues.imageUrls || []);
  const [selectedDelete, setSelectedDelete] = useState([]);

  const [inputPreviews, setInputPreviews] = useState([]);
  const [images, setImages] = useState([]);


  const handleRemoveImage = (index) => {
    const selectedImage = previews[index]['imageName'];
    const x = !previews[index]?.delete;
    setPreviews((prev) =>
        prev.map((item, i) => (i === index ? { ...item, delete: x } : item))
    );
    selectedDelete[index] = selectedImage;
  }

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setImages((prevImages) => [...prevImages, ...files]);
    setInputPreviews((prevPreviews) => [...prevPreviews, ...files.map(file => URL.createObjectURL(file))]);
  };

  const handleRemoveFile = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    setInputPreviews((prevPreviews) => prevPreviews.filter((_, i) => i !== index));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
  };

  const handleCancel = (e) => {
    navigate(`/dashboard`);
  };


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
    formData.append("imageUrls", formValues.imageUrls);
    formData.append("delete_images", JSON.stringify(selectedDelete));

    console.log('sending for deletion: ', formData.delete_images);

    console.log("FormData payload:", formData);
    try {
      await axiosPrivate.put(`/cars/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      toast.success('Данные о машине обновлены!', {
        position: "top-right",
        autoClose: 3000
      });
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    } catch (error) {
      toast.error('Ошибка при обновлении данных. Попробуйте снова.', {
        position: "top-right",
        autoClose: 3000
      });
      console.error("Error updating:", error);
    }
  };

  // const handleSaveChanges = async () => {
  //   let id = formValues.id;
  //
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
  //     await axiosPrivate.put(`/cars/${id}`, payload, {
  //       headers: {
  //         'Content-Type': 'application/json'
  //       }
  //     });
  //     toast.success('Данные о машине обновлены!', {
  //       position: "top-right",
  //       autoClose: 3000
  //     });
  //     setTimeout(() => {
  //       navigate('/dashboard');
  //     }, 3000);
  //   } catch (error) {
  //     toast.error('Ошибка при обновлении университета. Попробуйте снова.', {
  //       position: "top-right",
  //       autoClose: 3000
  //     });
  //     console.error('Error updating university:', error);
  //   }
  // };


  return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Обновить информацию
          </Typography>
          <Box sx={{ mt: 3 }}>
                <>
                  <Typography variant="h6" gutterBottom>
                    Parameters:
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                    id: {formValues.id}
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
                      <MenuItem value="new">new</MenuItem>
                      <MenuItem value="used">pre-owned</MenuItem>
                    </Select>
                  </FormControl>
                  <Paper sx={{p: 3}}>
                  <div style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between"
                  }}>
                    <Paper sx={{p: 3}}>
                    <div style={{
                      borderRadius: "15px",
                      minHeight: "200px",
                      padding: "20px",
                      width: "450px"
                    }}>

                      <div>
                        <Typography sx={{p: 1, fontSize: "20px"}}>Текущие изображения:</Typography>
                      </div>
                      <div>
                        {previews.map((preview, index) => (
                            <div
                                key={index}
                                style={{overflow: 'hidden', width: '400px', height: '300px', display: 'block', marginBottom: '30px'}}
                            >
                              <img
                                  src={preview.url}
                                  alt="Preview"
                                  style={{
                                    width: '400px',
                                    height: '250px',
                                    objectFit: 'contain',
                                    border: "1px solid lightgray",
                                    borderRadius: '15px',
                                    padding: '10px'
                                  }}
                              />
                              <button
                                  style={{
                                    backgroundColor: preview?.delete ? "gray" : "indianred",
                                    color: 'white',
                                    fontSize: '15px',
                                    fontWeight: '200',
                                    border: 'none',
                                    borderRadius: '5px',
                                    padding: '10px',
                                    width: '400px',
                                    height: '40px',
                                    opacity: preview?.delete ? 0.5 : 1
                                  }}
                                  onClick={() =>  handleRemoveImage(index)}
                              >
                                {preview?.delete ? "Отменить" : "Удалить"}
                              </button>
                            </div>
                        ))}
                      </div>
                    </div>
                    </Paper>
                    <Paper sx={{p: 3}}>
                    <div style={{
                      borderRadius: "15px",
                      minHeight: "200px",
                      padding: "20px",
                      width: "450px"
                    }}>
                      <div>
                        <Typography sx={{p: 1, fontSize: "20px"}}>Добавить изображения:</Typography>
                      </div>
                      <input type="file" accept="image/*" multiple onChange={handleFileChange}/>
                      <div>
                        {inputPreviews.map((preview, index) => (
                            <div
                                key={index}
                                style={{overflow: 'hidden', width: '400px', height: '300px'}}
                            >
                              <img
                                  src={preview}
                                  alt="Preview"
                                  style={{
                                    width: '100%',
                                    height: 'auto',
                                    objectFit: 'cover',
                                    border: "1px solid lightgray",
                                    borderRadius: '15px',
                                    padding: '10px'
                                  }}
                              />
                              <button
                                  style={{
                                    backgroundColor: preview?.delete ? "gray" : "indianred",
                                    color: 'white',
                                    fontSize: '15px',
                                    fontWeight: '200',
                                    border: 'none',
                                    borderRadius: '5px',
                                    padding: '10px',
                                    width: '400px',
                                    height: '40px',
                                    opacity: preview?.delete ? 0.5 : 1
                                  }}
                                  onClick={() => handleRemoveFile(index)}
                              >
                                {preview?.delete ? "Отменить" : "Удалить"}
                              </button>
                            </div>
                        ))}
                      </div>
                    </div>
                    </Paper>
                  </div>
                  </Paper>
                </>
          </Box>
          <Box sx={{mt: 3, justifyContent: 'space-between', display: 'flex'}}>
            <Button variant="outlined" color="secondary" sx={{mr: 2}} onClick={handleCancel}>
              Отменить
            </Button>
            <Button variant="contained" color="success" onClick={handleSaveChanges}>
              Сохранить
            </Button>
          </Box>
        </Paper>
      </Container>
  );
};

export default UniversityReadUpdatePage;



