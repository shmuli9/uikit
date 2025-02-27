import {
  ReactNode,
  RefAttributes,
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react'
import { Image } from './image.js'
import { Texture, VideoTexture } from 'three'
import { signal } from '@preact/signals-core'
import { VideoProperties as BaseVideoProperties, ImageProperties } from '@pmndrs/uikit'
import { updateVideoElement } from '@pmndrs/uikit/internals'
import { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events.js'
import { ComponentInternals } from './ref.js'

const VideoContext = createContext<HTMLVideoElement | undefined>(undefined)

export function useVideoElement(): HTMLVideoElement {
  const element = useContext(VideoContext)
  if (element == null) {
    throw new Error(`useVideoElement can only be executed inside a Video component`)
  }
  return element
}

export type VideoInternals = ComponentInternals<Omit<ImageProperties, 'src'> & EventHandlers> & {
  element: HTMLVideoElement
}

export type VideoProperties = BaseVideoProperties &
  EventHandlers & {
    children?: ReactNode
  }

export const Video: (props: VideoProperties & RefAttributes<VideoInternals>) => ReactNode = forwardRef(
  (props: VideoProperties, ref) => {
    const texture = useMemo(() => signal<Texture | undefined>(undefined), [])
    const aspectRatio = useMemo(() => signal<number>(1), [])
    const video = useMemo(() => document.createElement('video'), [])
    useEffect(() => {
      if (!props.autoplay) {
        return
      }
      document.body.append(video)
      return () => video.remove()
    }, [props.autoplay, video])
    const { src, autoplay, volume, preservesPitch, playbackRate, muted, loop } = props
    updateVideoElement(video, src, autoplay, volume, preservesPitch, playbackRate, muted, loop)
    useEffect(() => {
      const updateAspectRatio = () => (aspectRatio.value = video.videoWidth / video.videoHeight)
      updateAspectRatio()
      video.addEventListener('resize', updateAspectRatio)
      return () => video.removeEventListener('resize', updateAspectRatio)
    }, [aspectRatio, video])
    useEffect(() => {
      const videoTexture = new VideoTexture(video)
      texture.value = videoTexture
      return () => videoTexture.dispose()
    }, [texture, video])

    const internalRef = useRef<ComponentInternals<ImageProperties>>(null)
    useImperativeHandle(ref, () => ({ ...internalRef.current!, element: video }), [video])
    return (
      <VideoContext.Provider value={video}>
        <Image aspectRatio={aspectRatio} {...props} ref={internalRef} src={texture} />
      </VideoContext.Provider>
    )
  },
)
