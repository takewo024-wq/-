import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CONTAINER, SERVICES, getService } from "../../_lib/site";
import {
  SiteHeader,
  SiteFooter,
  PageHeader,
  SectionLabel,
  ContactCta,
} from "../../_components/site-chrome";
import { Icon, CheckIcon } from "../../_components/icons";

type Props = { params: Promise<{ slug: string }> };

// 事前に全サービスのページを用意（高速表示）
export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return { title: "サービス | ひだまり（仮）" };
  return {
    title: `${service.tag} | ひだまり（仮）`,
    description: service.lead,
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  return (
    <div className="min-h-screen bg-white text-ink">
      <SiteHeader />
      <main>
        <PageHeader
          title={service.tag}
          lead={service.lead}
          crumbs={[
            { label: "ホーム", href: "/" },
            { label: "サービス紹介", href: "/services" },
            { label: service.tag },
          ]}
        />

        <section className={`${CONTAINER} py-14 md:py-20`}>
          {/* イラスト帯（仮） */}
          <div className="relative mb-10 aspect-[16/6] overflow-hidden rounded-3xl bg-brand-tint2 ring-1 ring-brand/15">
            <Image
              src={service.image}
              alt={`${service.tag}のイメージイラスト（仮）`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1100px"
              className="object-cover"
            />
          </div>

          <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr]">
            {/* 左：内容 */}
            <div>
              <div className="flex items-center gap-4">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand text-white">
                  <Icon name={service.icon} className="h-7 w-7" />
                </span>
                <h2 className="text-xl font-bold leading-relaxed">{service.title}</h2>
              </div>

              <div className="mt-8">
                <SectionLabel>活動・支援の内容</SectionLabel>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {service.activities.map((a) => (
                    <li
                      key={a}
                      className="flex items-start gap-2.5 rounded-xl bg-brand-tint2 px-4 py-3 text-sm"
                    >
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 右：概要の表 */}
            <aside>
              <div className="rounded-3xl border border-black/5 bg-brand-tint2 p-6">
                <SectionLabel>ご利用の概要</SectionLabel>
                <dl className="mt-4 divide-y divide-black/5">
                  {service.details.map((d) => (
                    <div key={d.label} className="py-3">
                      <dt className="text-xs font-bold text-brand-dark">{d.label}</dt>
                      <dd className="mt-1 text-sm leading-7 text-ink">{d.value}</dd>
                    </div>
                  ))}
                </dl>
                <Link
                  href="/#contact"
                  className="mt-5 block rounded-full bg-brand px-6 py-3.5 text-center text-sm font-bold text-white transition hover:bg-brand-dark"
                >
                  見学・ご相談はこちら
                </Link>
              </div>
            </aside>
          </div>

          {/* もう一方のサービスへ */}
          <div className="mt-14 border-t border-black/5 pt-8">
            <SectionLabel>ほかのサービス</SectionLabel>
            <div className="mt-4 flex flex-wrap gap-3">
              {SERVICES.filter((s) => s.slug !== service.slug).map((s) => (
                <Link
                  key={s.slug}
                  href={`/services/${s.slug}`}
                  className="inline-flex items-center gap-2 rounded-full border border-brand/40 bg-white px-5 py-2.5 text-sm font-bold text-brand-dark transition hover:bg-brand-tint"
                >
                  <Icon name={s.icon} className="h-4 w-4" />
                  {s.tag}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <ContactCta />
      </main>
      <SiteFooter />
    </div>
  );
}
