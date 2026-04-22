'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Report } from '@/types/report'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { types } from 'util'

/* =========================
   ZOD SCHEMA
========================= */

const formSchema = z.object({
  jalan: z.string().min(3, 'Nama jalan minimal 3 karakter'),

  latitude: z.coerce
    .number()
    .min(-90, 'Latitude tidak valid')
    .max(90, 'Latitude tidak valid'),

  longitude: z.coerce
    .number()
    .min(-180, 'Longitude tidak valid')
    .max(180, 'Longitude tidak valid'),

  priority: z.enum(['low', 'medium', 'high']),

  status: z.enum(['issued', 'progress', 'solved']),

  label_id: z.coerce.number().nullable().optional(),

  desc: z.string().min(5, 'Deskripsi minimal 5 karakter'),

  pic: z.any().optional()
})

type FormValues = z.infer<typeof formSchema>

/* =========================
   TYPE REPORT
========================= */

// interface Report {
//   id: number
//   jalan: string
//   latitude: number
//   longitude: number
//   priority: string
//   status: string
//   label_id?: number | null
//   desc: string
//   pic?: string
// }

/* =========================
   PROPS
========================= */

interface ReportFormProps {
  report?: Report | null
  onSuccess: () => void
  onClose: () => void
}

/* =========================
   COMPONENT
========================= */

export default function ReportForm({
  report,
  onSuccess,
  onClose
}: ReportFormProps) {

  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jalan: '',
      latitude: 0,
      longitude: 0,
      priority: 'low',
      status: 'issued',
      label_id: undefined,
      desc: '',
      pic: undefined
    }
  })

  /* =========================
     EDIT MODE
  ========================= */

  useEffect(() => {
    if (report) {
      form.reset({
        jalan: report.jalan,
        latitude: report.latitude,
        longitude: report.longitude,
        priority: report.priority as any,
        status: report.status as any,
        label_id: report.label_id ?? undefined,
        desc: report.desc,
        pic: undefined
      })

      if (report.pic) {
        setPreview(`http://localhost:8000/${report.pic}`)
      }

    } else {
      form.reset()
      setPreview(null)
    }
  }, [report, form])

  /* =========================
     HANDLE FILE
  ========================= */

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    const file = e.target.files?.[0]

    if (file) {
      const objectUrl = URL.createObjectURL(file)

      setPreview(objectUrl)
      form.setValue('pic', file)
    }
  }

  /* =========================
     SUBMIT
  ========================= */

  const onSubmit = async (values: FormValues) => {

    setLoading(true)

    const formData = new FormData()

    formData.append('jalan', values.jalan)
    formData.append('latitude', String(values.latitude))
    formData.append('longitude', String(values.longitude))
    formData.append('priority', values.priority)
    formData.append('status', values.status)
    formData.append('desc', values.desc)

    if (values.label_id) {
      formData.append('label_id', String(values.label_id))
    }

    if (values.pic instanceof File) {
      formData.append('pic', values.pic)
    }

    try {

      if (report?.id) {

        formData.append('_method', 'PUT')

        await api.post(
          `/reports/${report.id}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        )

        toast.success('Report berhasil diupdate')

      } else {

        await api.post(
          '/reports',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        )

        toast.success('Report berhasil dibuat')
      }

      onSuccess()
      onClose()

    } catch (err: any) {

      toast.error(
        err.response?.data?.message ||
        'Gagal menyimpan report'
      )

    } finally {

      setLoading(false)
    }
  }

  /* =========================
     UI
  ========================= */

  return (

    <Form {...form}>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5"
      >

        {/* JALAN */}

        <FormField
          control={form.control}
          name="jalan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Jalan</FormLabel>
              <FormControl>
                <Input
                  placeholder="Contoh: Jl. Sudirman"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* LATITUDE */}

        <FormField
          control={form.control}
          name="latitude"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Latitude</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.00000001"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* LONGITUDE */}

        <FormField
          control={form.control}
          name="longitude"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Longitude</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.00000001"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* PRIORITY */}

        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="w-full border rounded-md p-2"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* STATUS */}

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="w-full border rounded-md p-2"
                >
                  <option value="issued">Issued</option>
                  <option value="progress">Progress</option>
                  <option value="solved">Solved</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* DESKRIPSI */}

        <FormField
          control={form.control}
          name="desc"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi</FormLabel>
              <FormControl>
                <Input
                  placeholder="Deskripsi laporan"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* FILE */}

        <FormItem>
          <FormLabel>
            Foto Laporan
          </FormLabel>

          <FormControl>

            <Input
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleFileChange}
            />

          </FormControl>

          <FormMessage />

        </FormItem>

        {/* PREVIEW */}

        {preview && (

          <div className="mt-2">

            <p className="text-sm text-muted-foreground mb-1">
              Preview:
            </p>

            <div className="border rounded-md overflow-hidden w-40 h-40">

              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    '/placeholder-image.jpg'
                }}
              />

            </div>

          </div>
        )}

        {/* ACTION */}

        <div className="flex justify-end gap-3 pt-4">

          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Batal
          </Button>

          <Button
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Menyimpan...'
              : report
              ? 'Update Report'
              : 'Tambah Report'}
          </Button>

        </div>

      </form>

    </Form>
  )
}