import React, { useEffect, useState } from "react"
import { User } from "../@types/auth"
import { get, post } from "../fetchers/fetchers"
import { DownloadDTO, ExportDTO, ExportJournalDTO, SourceDTO } from "../@types/dto"

export const useGetUserInfo = () => {
  const [userInfo, setUserInfo] = useState<User>()
  const getData = async () => {
    const result = await get<User>(process.env.REACT_APP_BACKEND_PATH_LOGIN_INFO)
    setUserInfo(result)
  }

  useEffect(() => {
    getData()
  }, [])
  return userInfo
}

export const useFindAllDatamarts = () => {
  const [datamarts, setDatamarts] = useState<ExportDTO>()
  const getData = async () => {
    const result = await get<ExportDTO>(process.env.REACT_APP_BACKEND_EXPORT_DATAMARTS)
    setDatamarts(result)
  }

  useEffect(() => {
    getData()
  }, [])
  return datamarts
}

export const useFindAllSources = () => {
  const [sources, setSources] = useState<SourceDTO[]>([])
  const getData = async () => {
    const result = await get<SourceDTO[]>(process.env.REACT_APP_BACKEND_EXPORT_SOURCES)
    setSources(result)
  }

  useEffect(() => {
    getData()
  }, [])
  return sources
}

export const useFindAllExport = () => {
  const [exports, setExports] = useState<ExportJournalDTO[]>([])
  const getData = async () => {
    const result = await get<ExportJournalDTO[]>(process.env.REACT_APP_BACKEND_EXPORT_JOBS)
    setExports(result)
  }

  useEffect(() => {
    getData()
  }, [])
  return exports
}

export const downloadTable = (params: DownloadDTO) => {
  const [data, setData] = useState<string>()
  const getData = async () => {
    const result = await post<DownloadDTO, string>(params, process.env.REACT_APP_BACKEND_EXPORT_DOWNLOAD)
    setData(result)
  }
  useEffect(() => {
    getData()
  }, [])
  return data
}
