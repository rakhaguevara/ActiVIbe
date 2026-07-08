declare module 'react-pageflip' {
  import type { ReactNode, Ref, HTMLAttributes } from 'react'

  export interface FlipBookSettings {
    startPage?: number
    size?: 'fixed' | 'stretch'
    width: number
    height: number
    minWidth?: number
    maxWidth?: number
    minHeight?: number
    maxHeight?: number
    drawShadow?: boolean
    flippingTime?: number
    usePortrait?: boolean
    startZIndex?: number
    autoSize?: boolean
    maxShadowOpacity?: number
    showCover?: boolean
    mobileScrollSupport?: boolean
    clickEventForward?: boolean
    useMouseEvents?: boolean
    swipeDistance?: number
    showPageCorners?: boolean
    disableFlipByClick?: boolean
    className?: string
    style?: React.CSSProperties
    children?: ReactNode
  }

  export interface PageFlipInstance {
    getPageCount: () => number
    getCurrentPageIndex: () => number
    getOrientation: () => 'portrait' | 'landscape'
    turnToPage: (pageNum: number) => void
    turnToNextPage: () => void
    turnToPrevPage: () => void
    flipNext: (corner?: 'top' | 'bottom') => void
    flipPrev: (corner?: 'top' | 'bottom') => void
    flip: (pageNum: number, corner?: 'top' | 'bottom') => void
  }

  export interface FlipBookHandle {
    pageFlip: () => PageFlipInstance
  }

  export interface PageFlipEvent {
    data: number | string
    object: PageFlipInstance
  }

  export type FlipBookProps = FlipBookSettings &
    Omit<HTMLAttributes<HTMLDivElement>, 'onFlip'> & {
      ref?: Ref<FlipBookHandle>
      onFlip?: (event: PageFlipEvent) => void
      onChangeOrientation?: (event: PageFlipEvent) => void
      onChangeState?: (event: PageFlipEvent) => void
      onInit?: (event: PageFlipEvent) => void
      onUpdate?: (event: PageFlipEvent) => void
    }

  const HTMLFlipBook: React.ForwardRefExoticComponent<FlipBookProps>
  export default HTMLFlipBook
}
