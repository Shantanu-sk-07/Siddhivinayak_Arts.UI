import axios from "axios"
import { ApiResponse } from "@/types/SolarRecordMapper"
import {
  SolarRecordRequest,
  SolarRecordResponse
} from "@/types/SolarRecordMapper"

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

console.log("API URL:", import.meta.env.VITE_API_URL)

export const getSolarRecords = async (): Promise<SolarRecordResponse[]> => {
  const res = await API.get<ApiResponse<SolarRecordResponse[]>>(
    "/solar-records"
  )
  return res.data.data
}

export const getSolarRecordById = async (
  id: string
): Promise<SolarRecordResponse> => {
  const res = await API.get<ApiResponse<SolarRecordResponse>>(
    `/solar-records/${id}`
  )
  return res.data.data
}

export const createSolarRecord = async (data: SolarRecordRequest): Promise<SolarRecordResponse> => {
  const formData = new FormData();

  (Object.entries(data) as Array<[keyof SolarRecordRequest, unknown]>).forEach(([key, value]) => {
    if (key === "sitePhotos" && Array.isArray(value)) {
      (value as File[]).forEach((file: File) => {
        if (file instanceof File) formData.append("sitePhotos", file);
      });
    } else if (key === "aadharImages" && Array.isArray(value)) {
      (value as File[]).forEach((file: File) => {
        if (file instanceof File) formData.append("aadharImages", file);
      });
    } else if (key === "vendorSignature" && Array.isArray(value)) {
      (value as File[]).forEach((file: File) => {
        if (file instanceof File) formData.append("vendorSignature", file);
      });
    } else if (key === "consumerSignature" && Array.isArray(value)) {
      (value as File[]).forEach((file: File) => {
        if (file instanceof File) formData.append("consumerSignature", file);
      });
    } else if (key === "msedclSignature" && Array.isArray(value)) {
      (value as File[]).forEach((file: File) => {
        if (file instanceof File) formData.append("msedclSignature", file);
      });
    } else if (key === "vendorStamp" && Array.isArray(value)) {
      (value as File[]).forEach((file: File) => {
        if (file instanceof File) formData.append("vendorStamp", file);
      });
    } else if (key === "witnessSignature" && Array.isArray(value)) {
      (value as File[]).forEach((file: File) => {
        if (file instanceof File) formData.append("witnessSignature", file);
      });
    } else if (value !== undefined && value !== null && 
               key !== "aadharImages" && key !== "sitePhotos" &&
               key !== "vendorSignature" && key !== "consumerSignature" &&
               key !== "msedclSignature" && key !== "vendorStamp" && 
               key !== "witnessSignature") {
      formData.append(key, String(value));
    }
  });

  const res = await API.post<ApiResponse<SolarRecordResponse>>("/solar-records", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
};

export const updateSolarRecord = async (
  id: string,
  data: SolarRecordRequest
): Promise<SolarRecordResponse> => {
  const formData = new FormData()

  Object.entries(data).forEach(([key, value]) => {
    if (key === "sitePhotos" && Array.isArray(value)) {
      value.forEach((file) => {
        if (file instanceof File) {
          formData.append("sitePhotos", file)
        } else if (typeof file === "string") {
          formData.append("existingSitePhotos", file)
        }
      })
    } 
    else if (key === "aadharImages" && Array.isArray(value)) {
      value.forEach((file) => {
        if (file instanceof File) {
          formData.append("aadharImages", file)
        } else if (typeof file === "string") {
          formData.append("existingAadharImages", file)
        }
      })
    }
    else if (key === "vendorSignature" && Array.isArray(value)) {
      value.forEach((file) => {
        if (file instanceof File) {
          formData.append("vendorSignature", file)
        } else if (typeof file === "string") {
          formData.append("existingVendorSignature", file)
        }
      })
    }
    else if (key === "consumerSignature" && Array.isArray(value)) {
      value.forEach((file) => {
        if (file instanceof File) {
          formData.append("consumerSignature", file)
        } else if (typeof file === "string") {
          formData.append("existingConsumerSignature", file)
        }
      })
    }
    else if (key === "msedclSignature" && Array.isArray(value)) {
      value.forEach((file) => {
        if (file instanceof File) {
          formData.append("msedclSignature", file)
        } else if (typeof file === "string") {
          formData.append("existingMsedclSignature", file)
        }
      })
    }
    else if (key === "vendorStamp" && Array.isArray(value)) {
      value.forEach((file) => {
        if (file instanceof File) {
          formData.append("vendorStamp", file)
        } else if (typeof file === "string") {
          formData.append("existingVendorStamp", file)
        }
      })
    }
    else if (key === "witnessSignature" && Array.isArray(value)) {
      value.forEach((file) => {
        if (file instanceof File) {
          formData.append("witnessSignature", file)
        } else if (typeof file === "string") {
          formData.append("existingWitnessSignature", file)
        }
      })
    }
    else if (value !== undefined && value !== null && 
             key !== "aadharImages" && key !== "sitePhotos" &&
             key !== "vendorSignature" && key !== "consumerSignature" &&
             key !== "msedclSignature" && key !== "vendorStamp" && 
             key !== "witnessSignature") {
      formData.append(key, String(value))
    }
  })

  const res = await API.put(`/solar-records/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  })

  return res.data.data
}

export const deleteSolarRecord = async (id: string): Promise<void> => {
  await API.delete<ApiResponse<string>>(`/solar-records/${id}`)
}

export const downloadSolarPdf = async (
  id: string,
  type: string,
  format: "pdf" | "word" = "pdf"
): Promise<Blob> => {
  const url = format === "pdf" 
    ? `/api/solar/pdf/${id}/${type}`
    : `/api/solar/pdf/${id}/${type}/word`;

  const res = await API.get(url, {
    responseType: "blob"
  })

  return res.data
}