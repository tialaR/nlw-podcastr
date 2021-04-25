import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { api } from '../../services/api';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';
import styles from './episode.module.scss';
import {  usePlayer } from '../../contexts/PlayerContext';

type Episode = {
    id: string;
    title: string;
    members: string;
    publishedAt: string;
    thumbnail: string;
    duration: number;
    durationAsString: string;
    url: string;
    description: string;
  }

type EpisodeProps = {
    episode: Episode;
}

export default function Episode({ episode }: EpisodeProps) {
    const { play } = usePlayer();

    const router = useRouter();

    if(router.isFallback) {
        return <p>Carregando...</p>
    }

    return(
        <div className={styles.container}>
            <Head>
                <title>Podcastr | {episode.title}</title>
            </Head>

            <div className={styles.episode}>
                <div className={styles.thumbnailContainer}>
                    <Link href="/">
                        <button type="button">
                            <img src="/arrow-left.svg" alt="Voltar"/>
                        </button>
                    </Link>
                    <Image 
                        width={700}
                        height={160}
                        src={episode.thumbnail}
                        objectFit="cover"
                    />
                    <button onClick={() => play(episode)} type="button"> 
                        <img src="/play.svg" alt="Tocar episódio"/>
                    </button>
                </div>

                <header>
                    <h1>{episode.title}</h1>
                    <span>{episode.members}</span>
                    <span>{episode.publishedAt}</span>
                    <span>{episode.durationAsString}</span>
                </header>

                <div 
                    className={styles.description}
                    dangerouslySetInnerHTML={{ __html: episode.description }} //Forçando renderização do texto em html
                />
            </div>
        </div>
    );
}

//Para páginas estáticas dinâmicas (que ultilizam colchetes por volta) deve ser exportado o método:
//Páginas estáticas dinâmicas = Páginas estáticas que tem parâmetros
export const getStaticPaths: GetStaticPaths = async () => {
    //Recuperando os episódios:
    const { data } = await api.get('/episodes',  {
        params: {
        _limit: 2, //Estabelecendo limite de episódios na requisição (e que serão gerados de forma estática)
        _sort: 'published_at', //Ordenação
        _order: 'desc', //Ordenação na ordem decrescente
        }
    });

    //Criando array de epiódios que serão gerados de forma estática no momento da build
    const paths = data.map(episode => {
        return {
            params: {
                slug: episode.id,
            }
        }
    });

    return {
        paths: paths, //Episódios que serão gerados de forma estática no momento da build
        fallback: 'blocking',
    }
}

export const getStaticProps: GetStaticProps = async (context) => {
    const { slug } = context.params; //Recuperando epísódio que foi passado por parâmetro

    const { data } = await api.get(`/episodes/${slug}`);

    const episode = {
        id: data.id,
        title: data.title,
        thumbnail: data.thumbnail,
        members: data.members,
        publishedAt: format(parseISO(data.published_at), 'd MMM yy', { locale: ptBR }),
        duration: Number(data.file.duration),
        durationAsString: convertDurationToTimeString(Number(data.file.duration)),
        description: data.description,
        url: data.file.url,
      }      

    return {
        props: {
            episode,
        },
        revalidate: 60 * 60 * 24, //24 horas
    }
}
