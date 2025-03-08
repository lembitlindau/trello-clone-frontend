import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Button, TextField, Typography, Box, Alert, Paper } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { RegisterRequest } from '../../types';
import { Link } from 'react-router-dom';

const validationSchema = Yup.object({
  username: Yup.string()
    .required('Kasutajanimi on kohustuslik')
    .min(3, 'Kasutajanimi peab olema vähemalt 3 tähemärki pikk')
    .max(30, 'Kasutajanimi võib olla kuni 30 tähemärki pikk'),
  password: Yup.string()
    .required('Parool on kohustuslik')
    .min(6, 'Parool peab olema vähemalt 6 tähemärki pikk'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Paroolid peavad ühtima')
    .required('Parooli kinnitus on kohustuslik'),
});

interface RegisterFormValues extends RegisterRequest {
  confirmPassword: string;
}

const RegisterForm: React.FC = () => {
  const { register, isLoading, error } = useAuth();

  const formik = useFormik<RegisterFormValues>({
    initialValues: {
      username: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      const { confirmPassword, ...registerData } = values;
      await register(registerData);
    },
  });

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Registreeru
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={formik.handleSubmit}>
        <TextField
          fullWidth
          id="username"
          name="username"
          label="Kasutajanimi"
          value={formik.values.username}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.username && Boolean(formik.errors.username)}
          helperText={formik.touched.username && formik.errors.username}
          margin="normal"
        />

        <TextField
          fullWidth
          id="password"
          name="password"
          label="Parool"
          type="password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
          margin="normal"
        />

        <TextField
          fullWidth
          id="confirmPassword"
          name="confirmPassword"
          label="Kinnita parool"
          type="password"
          value={formik.values.confirmPassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
          helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
          margin="normal"
        />

        <Button
          color="primary"
          variant="contained"
          fullWidth
          type="submit"
          disabled={isLoading}
          sx={{ mt: 2 }}
        >
          {isLoading ? 'Registreerimine...' : 'Registreeru'}
        </Button>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2">
            Juba registreerunud?{' '}
            <Link to="/login" style={{ textDecoration: 'none' }}>
              Logi sisse
            </Link>
          </Typography>
        </Box>
      </form>
    </Paper>
  );
};

export default RegisterForm;
