import { useCallback, useEffect, useState } from 'react';
import { Icon, Link } from '@atoms';

type PageProps = {
  index: number | null;
  isSelected: boolean;
  isActive: boolean;
};

type TablePaginationProps = {
  page?: number;
  numOfPages: number;
  onChangePage: (pageNumber: number) => void;
};

export const TablePagination = ({
  page,
  numOfPages,
  onChangePage,
}: TablePaginationProps) => {
  const MAGIC_MINIMAL_INDEXES = 7;
  const [currentIndex, setCurrentIndex] = useState<number | null>(page || 1);
  const [pages, setPages] = useState<PageProps[]>([]);

  const isInTheLastFiveCharacters = useCallback((pageIndex: number): boolean => {
    const startLastFiveIndexes = numOfPages - 5;
    return pageIndex > startLastFiveIndexes;
  }, [numOfPages]);

  const mapStructurePages = useCallback((): PageProps[] => {
    const pages = [] as Array<PageProps>;
    for (let index = 1; index <= numOfPages; index++) {
      pages.push({
        index,
        isActive: index === currentIndex,
        isSelected: false,
      });
    }
    return pages;
  }, [numOfPages, currentIndex]);

  const formatInitialPages = useCallback(() => {
    const pagesStructured = mapStructurePages();
    if (numOfPages > MAGIC_MINIMAL_INDEXES && currentIndex) {
      if (isInTheFirstFiveCharacters(currentIndex)) {
        setPages(mountFirstFivePagesMode(pagesStructured));
      } else if (isInTheLastFiveCharacters(currentIndex)) {
        setPages(mountLastFivePagesMode(pagesStructured));
      } else {
        setPages(mountMiddleOfThePagesMode(currentIndex, pagesStructured));
      }
    } else {
      setPages(pagesStructured);
    }
  }, [numOfPages, currentIndex, isInTheLastFiveCharacters, mapStructurePages]);

  useEffect(() => {
    formatInitialPages();
  }, [currentIndex, numOfPages, formatInitialPages]);

  const isInTheFirstFiveCharacters = (pageIndex: number): boolean => {
    return pageIndex < 5;
  };

  const mountFirstFivePagesMode = (pages: PageProps[]): PageProps[] => {
    const [page1, page2, page3, page4, page5] = pages;
    const [lastPage] = [...pages].reverse();
    const pagesToShow: PageProps[] = [];
    pagesToShow.push({ ...page1, isSelected: true });
    pagesToShow.push(page2);
    pagesToShow.push(page3);
    pagesToShow.push(page4);
    pagesToShow.push(page5);
    pagesToShow.push({
      index: null,
      isActive: false,
      isSelected: false,
    });
    pagesToShow.push({ ...lastPage, isSelected: true });
    return pagesToShow;
  };

  const mountLastFivePagesMode = (pages: PageProps[]): PageProps[] => {
    const [lp1, lp2, lp3, lp4, lp5] = [...pages].reverse();
    const [firstPage] = pages;
    const pagesToShow: PageProps[] = [];
    pagesToShow.push({ ...firstPage, isSelected: true });
    pagesToShow.push({
      index: null,
      isActive: false,
      isSelected: false,
    });
    pagesToShow.push(lp5);
    pagesToShow.push(lp4);
    pagesToShow.push(lp3);
    pagesToShow.push(lp2);
    pagesToShow.push({ ...lp1, isSelected: true });
    return pagesToShow;
  };

  const mountMiddleOfThePagesMode = (
    pageIndex: number,
    pages: PageProps[]
  ): PageProps[] => {
    const [firstPage] = pages;
    const [lastPage] = [...pages].reverse();
    const prevMiddlePage = pages.find((page) => page.index === pageIndex - 1);
    const middlePage = pages.find((page) => page.index === pageIndex);
    const nextMiddlePage = pages.find((page) => page.index === pageIndex + 1);
    const pagesToShow: PageProps[] = [];
    pagesToShow.push({ ...firstPage, isSelected: true });
    pagesToShow.push({
      index: null,
      isActive: false,
      isSelected: false,
    });
    pagesToShow.push(prevMiddlePage!);
    pagesToShow.push(middlePage!);
    pagesToShow.push(nextMiddlePage!);
    pagesToShow.push({
      index: null,
      isActive: false,
      isSelected: false,
    });
    pagesToShow.push({ ...lastPage, isSelected: true });
    return pagesToShow;
  };

  const selectPage = ({ index }: PageProps) => {
    if (index && index !== currentIndex) {
      setCurrentIndex(index);
      const newPages = pages.map((page) => ({
        ...page,
        isActive: page.index === index,
      }));
      setPages(newPages);
      onChangePage(index);
    }
  };

  const nextPage = () => {
    if (currentIndex && currentIndex < numOfPages) {
      const page = currentIndex + 1;
      setCurrentIndex(page);
      onChangePage(page);
    }
  };

  const previousPage = () => {
    if (currentIndex && currentIndex > 1) {
      const page = currentIndex - 1;
      setCurrentIndex(page);
      onChangePage(page);
    }
  };

  const paginationContainerClasses = [
    'flex justify-center items-center',
    'py-4',
  ].join(' ');

  const paginationItemsContainerClasses = [
    'flex items-center space-x-1',
  ].join(' ');

  const paginationArrowDisabledClasses = [
    'flex items-center justify-center',
    'w-8 h-8',
    'text-gray-400',
    'cursor-pointer',
    'hover:text-gray-600',
    'transition-colors duration-200',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' ');

  const paginationItemClasses = [
    'flex items-center justify-center',
    'w-8 h-8',
    'text-sm',
    'border border-gray-300',
    'rounded',
    'transition-all duration-200',
    'hover:bg-gray-50',
    'cursor-pointer',
  ].join(' ');

  const getPaginationItemClasses = (page: PageProps) => {
    const baseClasses = paginationItemClasses;
    const activeClasses = page.isActive ? 'bg-primary-theme text-white border-primary-theme shadow-md hover:bg-primary-theme-dark' : '';
    const clickableClasses = page.index ? '' : 'cursor-default hover:bg-transparent hover:border-gray-200';

    return [baseClasses, activeClasses, clickableClasses].filter(Boolean).join(' ');
  };

  return numOfPages > 1 && (
    <div className={paginationContainerClasses}>
      <div className={paginationItemsContainerClasses}>
        <button 
          className={paginationArrowDisabledClasses}
          disabled={page === 1} 
          onClick={previousPage}
        >
          <Icon.LeftOpen xs />
        </button>
        {pages.map((page, index) => (
          <div
            key={index}
            className={getPaginationItemClasses(page)}
            onClick={() => selectPage(page)}
          >
            {page.index ? page.index : '...'}
          </div>
        ))}
        <button 
          className={paginationArrowDisabledClasses}
          disabled={page === numOfPages} 
          onClick={nextPage}
        >
          <Icon.RightOpen xs />
        </button>
      </div>
    </div>
  );
};
