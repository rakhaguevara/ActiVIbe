import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type {
  OrganizerEvent,
  Applicant,
  ApplicantStatus,
  AttendanceRecord,
  Certificate,
  CommunicationLogEntry,
  EventRequirement,
  FeedbackSummary,
  SubOrganizer,
  TrafficSummary,
} from '../types/organizer'
import { mockCommunicationLogs } from '../data/mockOrganizer'
import type { CloseEventResult } from '../components/organizer/CloseEventWizard'
import {
  createEventRequest,
  listMyEventsRequest,
  addRoleRequest,
  addRequirementRequest,
  closeEventRequest,
  listApplicantsRequest,
  updateApplicantStatusRequest,
  addApplicantNoteRequest,
  assignApplicantRequest,
  getEventAttendanceRequest,
  checkInRequest,
  checkInByTicketRequest,
  markNoShowRequest,
  generateCertificatesRequest,
  listCertificatesRequest,
  getFeedbackSummaryRequest,
  getTrafficSummaryRequest,
  archiveEventRequest,
  restoreEventRequest,
  closeRegistrationRequest,
  listSubOrganizersRequest,
  createSubOrganizerRequest,
  updateSubOrganizerRequest,
  deleteSubOrganizerRequest,
  type CreateEventPayload,
  type CreateEventRolePayload,
  type SubOrganizerPayload,
} from '../lib/organizerApi'

interface OrganizerDataContextValue {
  isLoading: boolean
  events: OrganizerEvent[]
  applicants: Applicant[]
  attendanceRecords: AttendanceRecord[]
  certificates: Certificate[]
  feedbackSummaries: Record<string, FeedbackSummary>
  trafficSummary: TrafficSummary | null
  communicationLogs: CommunicationLogEntry[]
  requirements: EventRequirement[]
  subOrganizers: SubOrganizer[]
  addEvent: (payload: CreateEventPayload) => Promise<void>
  addRole: (eventId: string, role: CreateEventRolePayload) => Promise<void>
  updateApplicantStatus: (applicantId: string, status: ApplicantStatus) => Promise<void>
  addApplicantNote: (applicantId: string, note: string) => Promise<void>
  assignApplicant: (applicantId: string, roleId: string, shiftId: string) => Promise<void>
  addCommunicationLog: (log: CommunicationLogEntry) => void
  addRequirement: (eventId: string, requirement: { title: string; type: EventRequirement['type']; isMandatory: boolean }) => Promise<void>
  checkInAttendance: (attendanceId: string, method: 'qr' | 'manual') => Promise<void>
  checkInByTicket: (ticketCode: string) => Promise<void>
  markNoShow: (attendanceId: string) => Promise<void>
  closeEvent: (eventId: string, result: CloseEventResult) => Promise<void>
  generateCertificates: (eventId: string) => Promise<void>
  archiveEvent: (eventId: string) => Promise<void>
  restoreEvent: (eventId: string) => Promise<void>
  closeRegistration: (eventId: string) => Promise<void>
  // Return value (beda dari pola addEvent yang void) — dipakai CreateEventPage
  // utk langsung dapat id-nya begitu Sub Organizer baru disimpan, sebelum
  // dipakai sbg picSubOrganizerId di payload createEvent.
  addSubOrganizer: (payload: SubOrganizerPayload) => Promise<SubOrganizer>
  updateSubOrganizer: (id: string, payload: SubOrganizerPayload) => Promise<void>
  removeSubOrganizer: (id: string) => Promise<void>
}

const OrganizerDataContext = createContext<OrganizerDataContextValue | null>(null)

function reportError(err: unknown) {
  const message = err instanceof Error ? err.message : 'Terjadi kesalahan, coba lagi.'
  window.alert(message)
}

export function OrganizerDataProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [events, setEvents] = useState<OrganizerEvent[]>([])
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [feedbackSummaries, setFeedbackSummaries] = useState<Record<string, FeedbackSummary>>({})
  const [trafficSummary, setTrafficSummary] = useState<TrafficSummary | null>(null)
  const [communicationLogs, setCommunicationLogs] = useState<CommunicationLogEntry[]>(mockCommunicationLogs)
  const [subOrganizers, setSubOrganizers] = useState<SubOrganizer[]>([])

  const requirements = events.flatMap((e) => e.requirements)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const myEvents = await listMyEventsRequest()
        if (cancelled) return
        setEvents(myEvents)

        const [applicantLists, attendanceLists, certificateLists, feedbackList, traffic, subOrgs] = await Promise.all([
          Promise.all(myEvents.map((event) => listApplicantsRequest(event.id).catch(() => []))),
          Promise.all(myEvents.map((event) => getEventAttendanceRequest(event.id).catch(() => []))),
          Promise.all(myEvents.map((event) => listCertificatesRequest(event.id).catch(() => []))),
          Promise.all(
            myEvents.map(async (event) => [event.id, await getFeedbackSummaryRequest(event.id).catch(() => null)] as const),
          ),
          getTrafficSummaryRequest().catch(() => null),
          listSubOrganizersRequest().catch(() => []),
        ])
        if (cancelled) return
        setApplicants(applicantLists.flat())
        setAttendanceRecords(attendanceLists.flat())
        setCertificates(certificateLists.flat())
        setFeedbackSummaries(
          Object.fromEntries(feedbackList.filter((entry): entry is [string, FeedbackSummary] => entry[1] !== null)),
        )
        setTrafficSummary(traffic)
        setSubOrganizers(subOrgs)
      } catch (err) {
        if (!cancelled) reportError(err)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const addEvent = async (payload: CreateEventPayload) => {
    try {
      const event = await createEventRequest(payload)
      setEvents((prev) => [event, ...prev])
    } catch (err) {
      reportError(err)
    }
  }

  const addRole = async (eventId: string, role: CreateEventRolePayload) => {
    try {
      const newRole = await addRoleRequest(eventId, role)
      setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, roles: [...e.roles, newRole] } : e)))
    } catch (err) {
      reportError(err)
    }
  }

  const updateApplicantStatus = async (applicantId: string, status: ApplicantStatus) => {
    try {
      const updated = await updateApplicantStatusRequest(applicantId, status)
      setApplicants((prev) => prev.map((a) => (a.id === applicantId ? updated : a)))
    } catch (err) {
      reportError(err)
    }
  }

  const addApplicantNote = async (applicantId: string, note: string) => {
    try {
      const updated = await addApplicantNoteRequest(applicantId, note)
      setApplicants((prev) => prev.map((a) => (a.id === applicantId ? updated : a)))
    } catch (err) {
      reportError(err)
    }
  }

  const assignApplicant = async (applicantId: string, roleId: string, shiftId: string) => {
    try {
      const updated = await assignApplicantRequest(applicantId, roleId, shiftId)
      setApplicants((prev) => prev.map((a) => (a.id === applicantId ? updated : a)))
    } catch (err) {
      reportError(err)
    }
  }

  const addCommunicationLog = (log: CommunicationLogEntry) => setCommunicationLogs((prev) => [log, ...prev])

  const addRequirement = async (
    eventId: string,
    requirement: { title: string; type: EventRequirement['type']; isMandatory: boolean },
  ) => {
    try {
      const newRequirement = await addRequirementRequest(eventId, requirement)
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, requirements: [...e.requirements, newRequirement] } : e)),
      )
    } catch (err) {
      reportError(err)
    }
  }

  const checkInAttendance = async (attendanceId: string, method: 'qr' | 'manual') => {
    try {
      const updated = await checkInRequest(attendanceId, method)
      setAttendanceRecords((prev) => prev.map((r) => (r.id === attendanceId ? updated : r)))
    } catch (err) {
      reportError(err)
    }
  }

  // FR-044: check-in lewat kode tiket (dari email tiket volunteer) — tidak
  // selalu ada baris di attendanceRecords (roster itu keyed by assignment,
  // sedangkan tiket bisa dipakai walau applicant belum di-assign ke shift),
  // jadi cukup patch status di `applicants` supaya badge pipeline ter-update.
  const checkInByTicket = async (ticketCode: string) => {
    const result = await checkInByTicketRequest(ticketCode)
    setApplicants((prev) =>
      prev.map((a) => (a.id === result.applicationId ? { ...a, status: 'checked_in' } : a)),
    )
  }

  const markNoShow = async (attendanceId: string) => {
    try {
      const updated = await markNoShowRequest(attendanceId)
      setAttendanceRecords((prev) => prev.map((r) => (r.id === attendanceId ? updated : r)))
    } catch (err) {
      reportError(err)
    }
  }

  const closeEvent = async (eventId: string, result: CloseEventResult) => {
    try {
      const updatedEvent = await closeEventRequest(eventId, {
        finalStatuses: result.finalStatuses,
        impactValue: result.impactValue,
        closeReport: result.closeReport,
      })
      setEvents((prev) => prev.map((e) => (e.id === eventId ? updatedEvent : e)))
      setApplicants((prev) =>
        prev.map((a) => (result.finalStatuses[a.id] ? { ...a, status: result.finalStatuses[a.id] } : a)),
      )
    } catch (err) {
      reportError(err)
    }
  }

  const generateCertificates = async (eventId: string) => {
    try {
      await generateCertificatesRequest(eventId)
      const updated = await listCertificatesRequest(eventId)
      setCertificates((prev) => [...prev.filter((c) => !updated.some((u) => u.id === c.id)), ...updated])
    } catch (err) {
      reportError(err)
    }
  }

  const archiveEvent = async (eventId: string) => {
    try {
      const updated = await archiveEventRequest(eventId)
      setEvents((prev) => prev.map((e) => (e.id === eventId ? updated : e)))
    } catch (err) {
      reportError(err)
    }
  }

  const restoreEvent = async (eventId: string) => {
    try {
      const updated = await restoreEventRequest(eventId)
      setEvents((prev) => prev.map((e) => (e.id === eventId ? updated : e)))
    } catch (err) {
      reportError(err)
    }
  }

  const closeRegistration = async (eventId: string) => {
    try {
      const updated = await closeRegistrationRequest(eventId)
      setEvents((prev) => prev.map((e) => (e.id === eventId ? updated : e)))
    } catch (err) {
      reportError(err)
    }
  }

  // Return value dipakai CreateEventPage utk langsung dapat id-nya sebelum
  // dipakai sbg picSubOrganizerId — lempar error ke pemanggil (bukan
  // reportError+swallow spt aksi lain) supaya alur submit event bisa berhenti
  // dgn jelas kalau simpan Sub Organizer gagal.
  const addSubOrganizer = async (payload: SubOrganizerPayload) => {
    const subOrganizer = await createSubOrganizerRequest(payload)
    setSubOrganizers((prev) => [...prev, subOrganizer].sort((a, b) => a.name.localeCompare(b.name)))
    return subOrganizer
  }

  const updateSubOrganizer = async (id: string, payload: SubOrganizerPayload) => {
    try {
      const updated = await updateSubOrganizerRequest(id, payload)
      setSubOrganizers((prev) => prev.map((s) => (s.id === id ? updated : s)).sort((a, b) => a.name.localeCompare(b.name)))
    } catch (err) {
      reportError(err)
    }
  }

  const removeSubOrganizer = async (id: string) => {
    try {
      await deleteSubOrganizerRequest(id)
      setSubOrganizers((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      reportError(err)
    }
  }

  return (
    <OrganizerDataContext.Provider
      value={{
        isLoading,
        events,
        applicants,
        attendanceRecords,
        certificates,
        feedbackSummaries,
        trafficSummary,
        communicationLogs,
        requirements,
        subOrganizers,
        addEvent,
        addRole,
        updateApplicantStatus,
        addApplicantNote,
        assignApplicant,
        addCommunicationLog,
        addRequirement,
        checkInAttendance,
        checkInByTicket,
        markNoShow,
        generateCertificates,
        archiveEvent,
        restoreEvent,
        closeEvent,
        closeRegistration,
        addSubOrganizer,
        updateSubOrganizer,
        removeSubOrganizer,
      }}
    >
      {children}
    </OrganizerDataContext.Provider>
  )
}

export function useOrganizerData() {
  const ctx = useContext(OrganizerDataContext)
  if (!ctx) {
    throw new Error('useOrganizerData must be used within an OrganizerDataProvider')
  }
  return ctx
}
